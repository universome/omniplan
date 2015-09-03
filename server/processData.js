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
        id: resourceData.$ ? resourceData.$.id : undefined,
        type: resourceData.type ? resourceData.type[0] : undefined,
        name: resourceData.name ? resourceData.name[0] : undefined,
        availableUnits: resourceData['units-available'] ? resourceData['units-available'][0] : undefined,
        childrenIds: resourceData['child-resource'] ? resourceData['child-resource'].map(r => r.$.idref): undefined,
        note: resourceData.note ? processNote(resourceData.note) : undefined,
        schedule: resourceData.schedule ? processCalendar(resourceData.schedule[0].calendar[0]) : undefined
        // style: resourceData.style ? processStyle(resourceData.style) : undefined
    };
}

export function processCalendar(calendarData) {
    return {
        name: calendarData.$ ? calendarData.$.name : undefined,
        // overtime: calendarData.$ ? calendarData.$.overtime === "yes" : false,
        // editable: calendarData.$ ? calendarData.$.editable === "yes" : false,
        events: calendarData.event ? calendarData.event.map(processCalendarEvent) : undefined
    };
}

export function processCalendarEvent(eventData) {
    return {
        startDate: eventData.$ ? new Date(eventData.$.start) : undefined,
        endDate: eventData.$ ? new Date(eventData.$.end) : undefined
    };
}

export function processNote(noteData) {
    return {
        text: noteData[0].text[0].p[0].run[0].lit ? noteData[0].text[0].p[0].run[0].lit[0] : undefined,
        style: noteData[0].text[0].p[0].run[0].style ? processStyle(noteData[0].text[0].p[0].run[0].style) : undefined
    };
}

export function processTask(taskData) {
    return {
        id: taskData.$ ? taskData.$.id : undefined,
        type: taskData.type ? taskData.type[0] : undefined,
        title: taskData.title ? taskData.title[0] : undefined,
        effort: taskData.effort ? taskData.effort[0] : undefined,
        note: taskData.note ? processNote(taskData.note) : undefined,
        childrenIds: taskData['child-task'] ? taskData['child-task'].map(r => r.$.idref): undefined,
        depsIds: taskData['prerequisite-task'] ? taskData['prerequisite-task'].map(r => r.$.idref): undefined,
        assignment: taskData.assignment ? {resourceId: taskData.assignment[0].$.idref, units: taskData.assignment[0].$.units} : undefined
    };
}

export function processStyle(styleData) {
    return {};
}
