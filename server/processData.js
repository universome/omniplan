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

        // Transform array of tasks to hashtable of tasks with {taskId: task} structure
        data.tasks = arrayToObject('id', data.tasks);

        // Add to each task with dependencies object with references to its dependencies
        ensureDepTasks(data.tasks);

        // Backup shallow copy so to have fast reference to all tasks object
        data.tasksHash = _.clone(data.tasks);

        // Put all child tasks inside their parents
        putChildTasksInParents(data.tasks);

        // Add depth property to tasks, so it will be easier to display them
        createDepthsOnTasks(data.tasks);

        // Add orders on tasks
        createOrdersOnTasks(data.tasks);

        // Add startDate and endDate to each task
        for (let taskId in data.tasksHash) {
            ensureDateOnTask(data.tasksHash[taskId], data.tasksHash, data.creationDate);
        }

        // Add offsets to tasks, so it will be easier to display them
        calculateOffsetsOnTasks(data.tasks, data.creationDate);

        // Add offsets to tasks, so it will be easier to display them
        calculateLeadTime(data.tasks);

        deleteDepTasks(data.tasksHash);
        delete data.tasksHash; // Now we can delete our backup
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

function arrayToObject(key, array) {
    let object = {};
    array.forEach(o => object[o[key]] = o);
    return object;
}

function putChildTasksInParents(tasks) {

    let linksToBeRemoved = []; // First, let's create links where we need them

    for (let taskId in tasks) {
        if (tasks[taskId].subTasks) {

            let subTasksObj = {}; // Making temporary object

            tasks[taskId].subTasks.forEach(subTaskId => {
                subTasksObj[subTaskId] = tasks[subTaskId];
                linksToBeRemoved.push(subTaskId);
            });

            tasks[taskId].subTasks = subTasksObj;
        }
    }

    // Second, remove links from main object
    linksToBeRemoved.forEach(taskId => delete tasks[taskId]);
}


function ensureDateOnTask(task, allTasks, defaultStartDate) {

    if (task.startDate && task.endDate) {
        return;
    }

    /* Counting startDate */

    task.startDate = defaultStartDate; // By default, task's startDate is startDate of its

    if (task.minStartDate && task.minStartDate.isAfter(task.startDate)) {
        task.startDate = task.minStartDate;
    }

    // If task has dependencies – its startDate should be the end of the latest dependency task
    if (task.depTasks) {
        let latestDepTask = null;

        for (let depTaskId in task.depTasks) {
            ensureDateOnTask(task.depTasks[depTaskId], allTasks, defaultStartDate);

            if (!latestDepTask || task.depTasks[depTaskId].endDate.isAfter(latestDepTask.endDate)) {
                latestDepTask = task.depTasks[depTaskId];
            }
        }

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

        for (let subTaskId in task.subTasks) {

            let subTask = task.subTasks[subTaskId];

            ensureDateOnTask(subTask, allTasks, task.startDate);

            if (!earliestSubTask || subTask.startDate.isBefore(earliestSubTask.startDate)) earliestSubTask = subTask;
            if (!latestSubTask || subTask.endDate.isAfter(latestSubTask.endDate)) latestSubTask = subTask;
        }

        task.effort = latestSubTask.endDate.diff(earliestSubTask.startDate, 'days');
    } else {
        task.effort = 0;
    }

    /* Counting endDate */

    task.endDate = countEndDate(task.startDate, task.effort);
    if (task.minEndDate && task.endDate.isBefore(task.minEndDate)) task.endDate = task.minEndDate;


    /* Do not forget to ensure dates on subtasks */

    if (task.subTasks) {
        for (let subTaskId in task.subTasks) {
            ensureDateOnTask(task.subTasks[subTaskId], allTasks, task.startDate);
        }
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

function ensureDepTasks(tasks) {
    for (let taskId in tasks) {
        if (!tasks[taskId].depTasksIds) continue;

        tasks[taskId].depTasks = {};

        tasks[taskId].depTasksIds.forEach((depTaskId) => {
            // Yes, we have tasks, which depends on each other (oh, these stupid managers)
            if (tasks[depTaskId].depTasksIds && tasks[depTaskId].depTasksIds.indexOf(taskId) >= 0) return;

            tasks[taskId].depTasks[depTaskId] = tasks[depTaskId];
        })
    }
}

function deleteDepTasks(tasks) {
    for (let taskId in tasks) {
        if (tasks[taskId].depTasks) delete tasks[taskId].depTasks;
    }
}

// function createnNextTasks(tasks) {
//     for (let taskId in tasks) {
//         if (tasks[taskId].depTasksIds) {
//             tasks[taskId].depTasksIds.forEach((depTaskId) => {
//                 tasks[depTaskId].nextTasks = tasks[depTaskId].nextTasks || {};
//                 tasks[depTaskId].nextTasks[taskId] = tasks[taskId];
//             });
//         }
//     }
// }

function createOrdersOnTasks(tasks, _order) {

    let order = _order || {counter: 1};

    for (let taskId in tasks) {
        
        if (tasks[taskId].order) continue;
        
        // Dependency task should be first
        if (tasks[taskId].depTasks) createOrdersOnTasks(tasks[taskId].depTasks, order);
        
        tasks[taskId].order = order.counter++;

        // Subtasks should be last
        if (tasks[taskId].subTasks) createOrdersOnTasks(tasks[taskId].subTasks, order);
    }
}

function createDepthsOnTasks(tasks, _depth) {

    let depth = _depth || 1;

    for (let taskId in tasks) {
        tasks[taskId].depth = depth;

        if (tasks[taskId].subTasks) {
            createDepthsOnTasks(tasks[taskId].subTasks, depth + 1);
        }
    }
}

function calculateOffsetsOnTasks(tasks, date) {
    for (let taskId in tasks) {
        tasks[taskId].offset = tasks[taskId].startDate.diff(date, 'days');

        if (tasks[taskId].subTasks) {
            calculateOffsetsOnTasks(tasks[taskId].subTasks, date);
        }
    }
}

function calculateLeadTime(tasks) {
    for (let taskId in tasks) {
        tasks[taskId].leadTime = tasks[taskId].endDate.diff(tasks[taskId].startDate, 'days');

        if (tasks[taskId].subTasks) {
            calculateLeadTime(tasks[taskId].subTasks);
        }
    }
}
