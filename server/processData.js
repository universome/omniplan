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
export default function processData(rawData) {
    return new Promise(function(resolve, reject) {

        if (!rawData) return reject(new Error('Data is not passed!'));

        let data = {};

        data.id = rawData.scenario.$.id;
        data.creationDate = moment(rawData.scenario['start-date'][0]);
        data.tasks = rawData.scenario.task.map(processTask);
        data.resources = rawData.scenario.resource.map(processResource);
        data.topTaskId = rawData.scenario['top-task'][0].$.idref;
        data.tasks[0].isOpened = true;

        let tasksMap = createMapFromArray('id', data.tasks);

        // 1. Some deps in omniplan are cyclic. We should remove such kind of deps
        // Attention: function is not perfect at all and only remove straightforward cyclic dependencies
        // 2. Some deps are duplicated. We need to remove duplicates also.
        fixDeps(data.tasks, tasksMap);

        // Add additional fields, so it will be easier to display task
        data.tasks.forEach(task => addDateToTask(task, tasksMap, data.creationDate));

        // Dependency tasks must be upper (this is  Gantt chart, bro)
        sortTasksWithDeps(data.tasks[0].subTasksIds.map(id => tasksMap[id]), tasksMap);

        // Calculating depths will allow us to easily add left paddings in Navigation panel
        addDepthsToTasks(data.tasks, tasksMap);

		// offset is amount of days since the time when Plan was created
        addOffsetsToTasks(data.tasks, data.creationDate);

        // leadTime is amount of days, which task takes, including holidays and weekends
        addLeadTime(data.tasks);

        // effortDone is amount of days, including holidays and so, that are spent on the task
        calculateDoneEffortInDays(data.tasks, tasksMap);

        // We need parent links on tasks when deciding draw or not to draw a task (do not draw when parent is closed)
        setParentLinksToTasks(data.tasks, tasksMap);

        resolve(data);
    });
}

function processResource(resourceData) {

    let resource = {};

    if (resourceData.$) resource.id = resourceData.$.id;
    if (resourceData.type) resource.type = resourceData.type[0];
    if (resourceData.name) resource.name = resourceData.name[0];
    if (resourceData['units-available']) resource.availableUnits = resourceData['units-available'][0];
    if (resourceData['child-resource']) resource.subResources = resourceData['child-resource'].map(r => r.$.idref);
    if (resourceData.note) resource.note = processNote(resourceData.note);
    if (resourceData.schedule) resource.schedule = processCalendar(resourceData.schedule[0].calendar[0]);
    // if (resourceData.style) resource.style = processStyle(resourceData.style);

    return resource;
}

function processCalendar(calendarData) {

    let calendar = {};

    if (calendarData.$) calendar.name = calendarData.$.name;
    if (calendarData.$) calendar.overtime = calendarData.$.overtime === 'yes';
    if (calendarData.$) calendar.editable = calendarData.$.editable === 'yes';
    if (calendarData.event) calendar.events = calendarData.event.map(processCalendarEvent);

    return calendar;
}

function processCalendarEvent(eventData) {
    let event = {};

    if (eventData.$) event.startDate = moment(eventData.$.start);
    if (eventData.$) event.endDate = moment(eventData.$.end);

    return event;
}

function processNote(noteData) {
    let note = {};

    if (noteData[0].text[0].p[0].run[0].lit) note.text = noteData[0].text[0].p[0].run[0].lit[0];
    if (noteData[0].text[0].p[0].run[0].style) note.style = processStyle(noteData[0].text[0].p[0].run[0].style);

    return note;
}

function processTask(taskData) {

    let task = {};

    if (taskData.$) task.id = taskData.$.id;
    if (taskData.type) task.type = taskData.type[0];
    if (taskData.title) task.title = taskData.title[0];
    if (taskData['effort']) task.effort = taskData.effort[0];
    if (taskData['effort-done']) task.effortDone = parseInt(taskData['effort-done'][0]);
    if (taskData['leveled-start']) task.leveledStartDate = moment(taskData['leveled-start'][0]);
    if (taskData['note']) task.note = processNote(taskData.note);
    if (taskData['start-no-earlier-than']) task.minStartDate = moment(taskData['start-no-earlier-than'][0]);
    if (taskData['start-constraint-date']) task.maxStartDate = moment(taskData['start-constraint-date'][0]);
    if (taskData['end-no-earlier-than']) task.minEndDate = moment(taskData['end-no-earlier-than'][0]);
    if (taskData['end-constraint-date']) task.maxEndDate = moment(taskData['end-constraint-date'][0]);
    if (taskData['child-task']) task.subTasksIds = taskData['child-task'].map(r => r.$.idref);
    if (taskData['prerequisite-task']) task.depTasksIds = taskData['prerequisite-task'].map(r => r.$.idref);
    if (taskData['assignment']) task.assignment = {resourceId: taskData.assignment[0].$.idref, units: taskData.assignment[0].$.units};
    if (taskData['user-data']) task.userDataList = processUserData(taskData['user-data'][0]);

    return task;
}

function processUserData(rawUserData) {

	let userDataKeys = rawUserData.key || [];
	let userDataValues = rawUserData.string || [];
	let userData = userDataKeys.map((key, i) => { return {key: key, value: userDataValues[i]} } );

	return userData.filter(el => el.key && el.value);
}

function processStyle(styleData) {

    let style = {};

    return style;
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
