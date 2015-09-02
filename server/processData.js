/*
    This function takes shitty XML-to-JSON parsed omniplan data and makes its structure more useful
*/
export default function processData(data) {
    return new Promise(function(resolve, reject) {

        if (!data) return reject(new Error('Data is passed!'));

        var newData = {
            id: data.scenario.$.id,
            creationDate: new Date(data.scenario['start-date'][0]),
            resources: data.scenario.resource.map(processResource),
            tasks: data.scenario.task.map(processTask)
        };

        resolve(newData);
    });
}

export function processResource(resourceData) {
    return {
        id: resourceData.$ ? resourceData.$.id : null,
        type: resourceData.type ? resourceData.type[0] : null,
        name: resourceData.name ? resourceData.name[0] : null,
        availableUnits: resourceData['units-available'] ? resourceData['units-available'][0] : null,
        childrenIds: resourceData['child-resource'] ? resourceData['child-resource'].map(r => r.$.idref): null,
        note: resourceData.note ? processNote(resourceData.note) : null,
        shedule: resourceData.shedule ? processCalendar(resourceData.shedule[0].calendar[0]) : null
        // style: resourceData.style ? processStyle(resourceData.style) : null
    };
}

export function processCalendar(calendarData) {
    return {
        name: calendarData.$ ? calendarData.$.name : null,
        // overtime: calendarData.$ ? calendarData.$.overtime === "yes" : false,
        // editable: calendarData.$ ? calendarData.$.editable === "yes" : false,
        events: calendarData.event ? calendarData.event.map(processCalendarEvent) : null
    };
}

export function processCalendarEvent(eventData) {
    return {
        startDate: eventData.$ ? new Date(eventData.$.start) : null,
        endDate: eventData.$ ? new Date(eventData.$.end) : null
    };
}

export function processNote(noteData) {
    return {
        text: noteData[0].text[0].p[0].run[0].lit ? noteData[0].text[0].p[0].run[0].lit[0] : null,
        style: noteData[0].text[0].p[0].run[0].style ? processStyle(noteData[0].text[0].p[0].run[0].style) : null
    };
}

export function processTask(taskData) {
    return {
        id: taskData.$ ? taskData.$.id : null,
        type: taskData.type ? taskData.type[0] : null,
        title: taskData.title ? taskData.title[0] : null,
        effort: taskData.effort ? taskData.effort[0] : null,
        note: taskData.note ? processNote(taskData.note) : null,
        childrenIds: taskData['child-task'] ? taskData['child-task'].map(r => r.$.idref): null,
        depsIds: taskData['prerequisite-task'] ? taskData['prerequisite-task'].map(r => r.$.idref): null,
        assignment: taskData.assignment ? {resourceId: taskData.assignment[0].$.idref, units: taskData.assignment[0].$.units} : null
    };
}

export function processStyle(styleData) {
    return {};
}
