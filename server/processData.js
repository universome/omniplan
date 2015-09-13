import R from 'ramda';
import _ from 'lodash';
import moment from 'moment';
import EventEmitter from 'events';

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

        let tasksMap = createMapFromArray('id', data.tasks);

        // Put child inside parents
        data.tasks = buildArrayTree('subTasks', 'id', data.tasks);

        fixDeps(data.tasks, tasksMap);

        // Add additional fields, so it will be easier to display task
        data.tasks.forEach(task => addDateToTask(task, tasksMap, data.creationDate));
        addOrdersToTasks(data.tasks, tasksMap);
        addDepthsToTasks(data.tasks);
        addOffsetsToTasks(data.tasks, data.creationDate); // offset – amount of days from Plan creation
        addLeadTime(data.tasks); // leadTime – amount of days, which task takes, including holidays and weekends

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
    if (calendarData.$) calendar.overtime = calendarData.$.overtime === "yes";
    if (calendarData.$) calendar.editable = calendarData.$.editable === "yes";
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

function processTask(taskData, index) {
    // var task = {order: index};

    let task = {};

    if (taskData.$) task.id = taskData.$.id;
    if (taskData.type) task.type = taskData.type[0];
    if (taskData.title) task.title = taskData.title[0];
    if (taskData.effort) task.effort = taskData.effort[0];
    if (taskData.note) task.note = processNote(taskData.note);
    if (taskData['start-no-earlier-than']) task.minStartDate = moment(taskData['start-no-earlier-than'][0]);
    if (taskData['start-constraint-date']) task.maxStartDate = moment(taskData['start-constraint-date'][0]);
    if (taskData['end-no-earlier-than']) task.minEndDate = moment(taskData['end-no-earlier-than'][0]);
    if (taskData['end-constraint-date']) task.maxEndDate = moment(taskData['end-constraint-date'][0]);
    if (taskData['child-task']) task.subTasks = taskData['child-task'].map(r => r.$.idref);
    if (taskData['prerequisite-task']) task.depTasksIds = taskData['prerequisite-task'].map(r => r.$.idref);
    if (taskData.assignment) task.assignment = {resourceId: taskData.assignment[0].$.idref, units: taskData.assignment[0].$.units};

    return task;
}

function processStyle(styleData) {

    let style = {};

    return style;
}

function createMapFromArray(key, array) {
    let map = {};
    array.forEach(object => map[object[key]] = object);
    return map;
}

function addDateToTask(task, tasksMap, defaultStartDate) {  

    if (task.endDate && task.startDate) return;

    /* Counting startDate */

    task.startDate = defaultStartDate; // By default, task's startDate is startDate of Plan.creationDate

    if (task.minStartDate && task.minStartDate.isAfter(task.startDate)) {
        task.startDate = task.minStartDate;
    }

    // If task has dependencies – its startDate should be the end of the latest dependency task
    if (task.depTasksIds) {
        let latestDepTask = null;

        task.depTasksIds.forEach(id => {
            addDateToTask(tasksMap[id], tasksMap, defaultStartDate);

            if (!latestDepTask || tasksMap[id].endDate.isAfter(latestDepTask.endDate)) {
                latestDepTask = tasksMap[id];
            }
        });

        if (latestDepTask && latestDepTask.endDate.isAfter(task.startDate)) {
            task.startDate = latestDepTask.endDate;
        }
    }


    /* Counting effort */

    if (task.effort) {
        task.effort = Math.round(parseInt(task.effort) / WORKING_TIME_PER_DAY);
    } else if (task.subTasks) {

        let earliestSubTask = null;
        let latestSubTask = null;

        task.subTasks.forEach((subTask) => {
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

    if (task.subTasks) {
        
        let latestSubTask = null;

        task.subTasks.forEach(subTask => {
            addDateToTask(subTask, tasksMap, task.startDate);

            if (!latestSubTask || subTask.endDate.isAfter(latestSubTask.endDate)) {
                latestSubTask = subTask;
            }
        });

        task.endDate = moment(latestSubTask.endDate);
    } else {
        task.endDate = countEndDate(task.startDate, task.effort);
    }

    if (task.minEndDate && task.endDate.isBefore(task.minEndDate)) {
        task.endDate = task.minEndDate;
    }


    /* Do not forget to ensure dates on subtasks */

    if (task.subTasks) {
        task.subTasks.forEach(subTask => addDateToTask(subTask, tasksMap, task.startDate));
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


function addOrdersToTasks(tasks, tasksMap, _order) {

    let order = _order || {counter: 1};

    tasks.forEach(task => {
        if (task.order) return;
        
        // Dependency task should be first
        if (task.depTasksIds) addOrdersToTasks(task.depTasksIds.map(id => tasksMap[id]), tasksMap, order);
        
        task.order = order.counter++;

        // Subtasks should be last
        if (task.subTasks) addOrdersToTasks(task.subTasks, tasksMap, order);
    });
}

function addDepthsToTasks(tasks, _depth) {

    let depth = _depth || 1;

    tasks.forEach(task => {
        task.depth = depth;

        if (task.subTasks) {
            addDepthsToTasks(task.subTasks, depth + 1);
        }
    });
}

function addOffsetsToTasks(tasks, date) {
    tasks.forEach(task => {
        task.offset = task.startDate.diff(date, 'days');

        if (task.subTasks) {
            addOffsetsToTasks(task.subTasks, date);
        }
    });
}

function addLeadTime(tasks) {
    tasks.forEach(task => {
        task.leadTime = task.endDate.diff(task.startDate, 'days');
        
        if (task.subTasks) addLeadTime(task.subTasks);
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

function buildArrayTree(childrenKey, idKey, array) {
    let tree = [];
    let objectsToDelete = [];
    
    array.forEach(object => {
        tree.push(object);
        
        if (object[childrenKey]) {
            object[childrenKey] = object[childrenKey].map(childId => R.find( R.propEq(idKey, childId), array) );
            object[childrenKey].forEach(child => objectsToDelete.push(child[idKey]));
        }
    });

    tree = tree.filter(object => !objectsToDelete.includes(object.id));

    return tree;
}

function fixDeps(tasks, tasksMap) {
    tasks.forEach(task => {
        if (task.depTasksIds) {
            task.depTasksIds.forEach(depTaskId => {
                
                if (!tasksMap[depTaskId].depTasksIds) return;

                let index = tasksMap[depTaskId].depTasksIds.indexOf(task.id);
                
                if (index >= 0) tasksMap[depTaskId].depTasksIds.splice(index, 1);
            });
        }

        if (task.subTasks) fixDeps(task.subTasks, tasksMap);
    });
}
