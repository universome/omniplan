import R from 'ramda';
import moment from 'moment';

// This function takes shitty XML-to-JSON parsed omniplan data and makes its structure more useful
export default function restructureInitialData(rawInitialData) {
	return new Promise(function(resolve, reject) {

		if (!rawInitialData) return reject(new Error('Data is not passed!'));

		let data = {};

		data.id = rawInitialData.scenario.$.id;
		data.creationDate = moment(rawInitialData.scenario['start-date'][0]);
		data.tasks = rawInitialData.scenario.task.map(restructureTask);
		data.resources = rawInitialData.scenario.resource.map(restructureResource);
		data.topTaskId = rawInitialData.scenario['top-task'][0].$.idref;
		data.tasks[0].isOpened = true;

		resolve(data);
	});
}

function restructureResource(resourceData) {

	let resource = {};

	if (resourceData.$) resource.id = resourceData.$.id;
	if (resourceData.type) resource.type = resourceData.type[0];
	if (resourceData.name) resource.name = resourceData.name[0];
	if (resourceData['units-available']) resource.availableUnits = resourceData['units-available'][0];
	if (resourceData['child-resource']) resource.subResources = resourceData['child-resource'].map(r => r.$.idref);
	if (resourceData.note) resource.note = restructureNote(resourceData.note);
	if (resourceData.schedule) resource.schedule = restructureCalendar(resourceData.schedule[0].calendar[0]);
	// if (resourceData.style) resource.style = restructureStyle(resourceData.style);

	return resource;
}

function restructureCalendar(calendarData) {

	let calendar = {};

	if (calendarData.$) calendar.name = calendarData.$.name;
	if (calendarData.$) calendar.overtime = calendarData.$.overtime === 'yes';
	if (calendarData.$) calendar.editable = calendarData.$.editable === 'yes';
	if (calendarData.event) calendar.events = calendarData.event.map(restructureCalendarEvent);

	return calendar;
}

function restructureCalendarEvent(eventData) {
	let event = {};

	if (eventData.$) event.startDate = moment(eventData.$.start);
	if (eventData.$) event.endDate = moment(eventData.$.end);

	return event;
}

function restructureNote(noteData) {
	let note = {};

	if (noteData[0].text[0].p[0].run[0].lit) note.text = noteData[0].text[0].p[0].run[0].lit[0];
	if (noteData[0].text[0].p[0].run[0].style) note.style = restructureStyle(noteData[0].text[0].p[0].run[0].style);

	return note;
}

function restructureTask(taskData) {

	let task = {};

	if (taskData.$) task.id = taskData.$.id;
	if (taskData.type) task.type = taskData.type[0];
	if (taskData.title) task.title = taskData.title[0];
	if (taskData['effort']) task.effort = taskData.effort[0];
	if (taskData['effort-done']) task.effortDone = parseInt(taskData['effort-done'][0]);
	if (taskData['leveled-start']) task.leveledStartDate = moment(taskData['leveled-start'][0]);
	if (taskData['note']) task.note = restructureNote(taskData.note);
	if (taskData['start-no-earlier-than']) task.minStartDate = moment(taskData['start-no-earlier-than'][0]);
	if (taskData['start-constraint-date']) task.maxStartDate = moment(taskData['start-constraint-date'][0]);
	if (taskData['end-no-earlier-than']) task.minEndDate = moment(taskData['end-no-earlier-than'][0]);
	if (taskData['end-constraint-date']) task.maxEndDate = moment(taskData['end-constraint-date'][0]);
	if (taskData['child-task']) task.subTasksIds = taskData['child-task'].map(r => r.$.idref);
	if (taskData['prerequisite-task']) task.depTasksIds = taskData['prerequisite-task'].map(r => r.$.idref);
	if (taskData['assignment']) task.assignment = {resourceId: taskData.assignment[0].$.idref, units: taskData.assignment[0].$.units};
	if (taskData['user-data']) task.userDataList = restructureUserData(taskData['user-data'][0]);

	return task;
}

function restructureUserData(rawUserData) {

	let userDataKeys = rawUserData.key || [];
	let userDataValues = rawUserData.string || [];
	let userData = userDataKeys.map((key, i) => { return {key: key, value: userDataValues[i]} } );

	return userData.filter(el => el.key && el.value);
}

function restructureStyle(styleData) {

	let style = {};

	return style;
}
