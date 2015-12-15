import R from 'ramda';
import moment from 'moment';
import createMapFromArray from '../app/helpers/createMapFromArray';

const WORKING_TIME_PER_DAY = 8 * 60 * 60; // We work 8 hours a day
const PUBLIC_HOLIDAYS = [
	moment().month(0).day(1),  // {month: 0, day: 1},
	moment().month(0).day(2),  // {month: 0, day: 2},
	moment().month(0).day(3),  // {month: 0, day: 3},
	moment().month(0).day(4),  // {month: 0, day: 4},
	moment().month(0).day(5),  // {month: 0, day: 5},
	moment().month(0).day(6),  // {month: 0, day: 6},
	moment().month(0).day(7),  // {month: 0, day: 7},
	moment().month(0).day(8),  // {month: 0, day: 8},
	moment().month(1).day(23), // {month: 1, day: 23},
	moment().month(2).day(8),  // {month: 2, day: 8},
	moment().month(4).day(1),  // {month: 4, day: 1},
	moment().month(4).day(9),  // {month: 4, day: 9},
	moment().month(5).day(12), // {month: 5, day: 12},
	moment().month(10).day(4)  // {month: 10, day: 4}
]

// This function takes shitty XML-to-JSON parsed omniplan data and makes its structure more useful
export default function enrichInitialData(projectData) {
	return new Promise(function(resolve, reject) {

		if (!projectData) return reject(new Error('Data is not passed!'));

		let tasksMap = createMapFromArray('id', projectData.tasks);

		// 1. Some deps in omniplan are cyclic. We should remove such kind of deps
		// Attention: function is not perfect at all and only remove straightforward cyclic dependencies
		// 2. Some deps are duplicated. We need to remove duplicates also.
		fixDeps(projectData.tasks, tasksMap);

		// Add additional fields, so it will be easier to display task
		projectData.tasks.forEach(task => addDateToTask(task, tasksMap, projectData.creationDate));

		// Dependency tasks must be upper (this is  Gantt chart, bro)
		sortTasksWithDeps(projectData.tasks[0].subTasksIds.map(id => tasksMap[id]), tasksMap);

		// Calculating depths will allow us to easily add left paddings in Navigation panel
		addDepthsToTasks(projectData.tasks, tasksMap);

		// offset is amount of days since the time when Plan was created
		addOffsetsToTasks(projectData.tasks, projectData.creationDate);

		// leadTime is amount of days, which task takes, including holidays and weekends
		addLeadTime(projectData.tasks);

		// effortDone is amount of days, including holidays and so, that are spent on the task
		calculateDoneEffortInDays(projectData.tasks, tasksMap);

		// We need parent links on tasks when deciding draw or not to draw a task (do not draw when parent is closed)
		setParentLinksToTasks(projectData.tasks, tasksMap);

		resolve(projectData);
	});
}

function addDateToTask(task, tasksMap, defaultStartDate) {

	if (task.endDate && task.startDate) return;

	/* Counting startDate */

	task.startDate = task.leveledStartDate || defaultStartDate; // By default, task's startDate is startDate of Plan.creationDate

	if (task.minStartDate && task.minStartDate.isAfter(task.startDate)) {
		task.startDate = task.minStartDate;
	}

	// If task has dependencies – its startDate should be the end of the latest dependency task
	if (task.depTasksIds) {
		let latestDepTask = null;

		task.depTasksIds.map(id => tasksMap[id]).forEach(depTask => {
			addDateToTask(depTask, tasksMap, defaultStartDate);

			if (!latestDepTask || depTask.endDate.isAfter(latestDepTask.endDate)) {
				latestDepTask = depTask;
			}
		});

		if (latestDepTask && latestDepTask.endDate.isAfter(task.startDate)) {
			task.startDate = latestDepTask.endDate;
		}
	}


	/* Counting effort */

	if (task.effort) {
		task.effort = Math.round(parseInt(task.effort) / WORKING_TIME_PER_DAY);
	} else if (task.subTasksIds) {

		let earliestSubTask = null;
		let latestSubTask = null;

		task.subTasksIds.map(id => tasksMap[id]).forEach((subTask) => {
			addDateToTask(subTask, tasksMap, task.startDate);

			if (!earliestSubTask || subTask.startDate.isBefore(earliestSubTask.startDate)) earliestSubTask = subTask;
			if (!latestSubTask || subTask.endDate.isAfter(latestSubTask.endDate)) latestSubTask = subTask;
		});

		// task.effort = latestSubTask.endDate.diff(earliestSubTask.startDate, 'days');
		task.effort = countWorkingDays(earliestSubTask.startDate, latestSubTask.endDate);
	} else {
		task.effort = 0;
	}

	/* Counting endDate */

	if (task.subTasksIds) {

		let latestSubTask = null;

		task.subTasksIds.map(id => tasksMap[id]).forEach(subTask => {
			addDateToTask(subTask, tasksMap, task.startDate);

			if (!latestSubTask || subTask.endDate.isAfter(latestSubTask.endDate)) latestSubTask = subTask;
		});

		task.endDate = moment(latestSubTask.endDate);
	} else {
		task.endDate = countEndDate(task.startDate, task.effort);
	}

	if (task.minEndDate && task.endDate.isBefore(task.minEndDate)) {
		task.endDate = task.minEndDate;
	}


	/* Do not forget to ensure dates on subtasks */

	if (task.subTasksIds) {
		task.subTasksIds.map(id => tasksMap[id]).forEach(subTask => addDateToTask(subTask, tasksMap, task.startDate));
	}
}


function countEndDate(startDate, days) {
	let endDate = moment(startDate);

	while (days > 0) {
		endDate.add(1, 'days');
		days -= 1;

		while (isHoliday(endDate)) endDate.add(1, 'days');
	}

	return endDate.add(days, 'days');
}

function isHoliday(date) {
	return date.isoWeekday() > 5 || PUBLIC_HOLIDAYS.some(holiday => date.isSame(holiday.year(date.year())) );
}


function sortTasksWithDeps(tasks, tasksMap) {
	// First, sort parent tasks
	tasks.sort(compareDirectSubtasks.bind(null, tasksMap));

	// Then, sort subTasks inside each of them separately
	tasks.forEach(task => {
		if (task.subTasksIds) {
			sortTasksWithDeps(task.subTasksIds.map(id => tasksMap), tasksMap);
		}
	});
}

function compareDirectSubtasks(tasksMap, aTask, bTask) {
	let aTaskAllIds = collectAllTasksIds(aTask, tasksMap);
	let bTaskAllIds = collectAllTasksIds(bTask, tasksMap);
	let aTaskAllDepsIds = collectAllDepTasksIds(aTask, tasksMap);
	let bTaskAllDepsIds = collectAllDepTasksIds(bTask, tasksMap);

	let doesBTaskDependOnATask = R.intersection(aTaskAllIds, bTaskAllDepsIds).length > 0;
	let doesATaskDepenOnBTask = R.intersection(bTaskAllIds, aTaskAllDepsIds).length > 0;

	switch (true) {
		case doesBTaskDependOnATask && doesATaskDepenOnBTask:
			console.warn('Wierd shit. A task depends on B task and backwards.');
			return 0;

		case !doesBTaskDependOnATask && !doesATaskDepenOnBTask:
			return 0; // Nothing depends on anything

		case doesATaskDepenOnBTask:
			return -1;

		case doesBTaskDependOnATask:
			return 1;
	}
}

function collectAllDepTasksIds(task, tasksMap) {
	let allDepTasksIds = task.depTasksIds || [];

	if (task.subTasksIds) {
		task.subTasksIds.map(id => tasksMap[id]).forEach(task => {
			allDepTasksIds = allDepTasksIds.concat(collectAllDepTasksIds(task, tasksMap));
		});
	}

	return allDepTasksIds;
}

function collectAllTasksIds(task, tasksMap) {
	let allTasksIds = [task.id];

	if (task.subTasksIds) {
		task.subTasksIds.map(id => tasksMap[id]).forEach(task => {
			allTasksIds = allTasksIds.concat(collectAllTasksIds(task, tasksMap));
		});
	}

	return allTasksIds;
}

function addDepthsToTasks(tasks, tasksMap, _depth) {

	let depth = _depth || 0;

	tasks.forEach(task => {

		if (task.depth) return;

		task.depth = depth;

		if (task.subTasksIds) {
			addDepthsToTasks(task.subTasksIds.map(id => tasksMap[id]), tasksMap, depth + 1);
		}
	});
}

function addOffsetsToTasks(tasks, date) {
	tasks.forEach(task => {
		task.offset = task.startDate.diff(date, 'days');
	});
}

function addLeadTime(tasks) {
	tasks.forEach(task => {
		task.leadTime = task.endDate.diff(task.startDate, 'days');
	});
}

function countWorkingDays(_startDate, _endDate) {
	let startDate = moment(_startDate);
	let endDate = moment(_endDate);
	let workingDays = 0;

	while (startDate.isBefore(endDate)) {
		while (isHoliday(startDate)) startDate.add(1, 'days');
		startDate.add(1, 'days');
		workingDays += 1;
	};

	return workingDays;
}

function fixDeps(tasks, tasksMap) {
	tasks.forEach(task => {
		if (task.depTasksIds) {
			task.depTasksIds = R.uniq(task.depTasksIds); // Removing duplicates
			task.depTasksIds.map(id => tasksMap[id]).forEach(depTask => {
				if (!depTask.depTasksIds) return;
				let index = depTask.depTasksIds.indexOf(task.id);
				if (index >= 0) depTask.depTasksIds.splice(index, 1) && console.log('Removed dep', depTask.id, '=>', task.id);
			})
		}
	});
}

function calculateDoneEffortInDays(tasks, tasksMap, _processedTasks) {

	let processedTasks = _processedTasks || [];

	tasks.forEach(task => {
		if (processedTasks.includes(task.id)) {
			return;
		} else if (task.effortDone) {
			let effortDoneEnd = countEndDate(task.startDate, task.effortDone / WORKING_TIME_PER_DAY);
			task.effortDone = effortDoneEnd.diff(task.startDate, 'days');
		} else if (task.subTasksIds) {
			calculateDoneEffortInDays(task.subTasksIds.map(id => tasksMap[id]), tasksMap, processedTasks);
			let totalEffortDone = task.subTasksIds.map(id => tasksMap[id].effortDone).reduce((a, b) => a + b);
			let totalEffortNeeded = task.subTasksIds.map(id => tasksMap[id].leadTime).reduce((a, b) => a + b);
			let effortDoneFraction = totalEffortDone / totalEffortNeeded;
			let effortDoneDays = effortDoneFraction * task.leadTime;
			task.effortDone = Math.round(effortDoneDays);
		} else {
			task.effortDone = 0;
		}

		processedTasks.push(task.id);
	});
}

function setParentLinksToTasks(tasks, tasksMap) {
	tasks.forEach(task => {
		if (task.subTasksIds) {
			task.subTasksIds.map(id => tasksMap[id]).forEach(subTask => subTask.parentTaskId = task.id);
		}
	});
}
