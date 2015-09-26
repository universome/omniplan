export default function checkIfTaskContainsResources(task, tasksMap, resourcesIds) {

    // First, recoursively filter all subtasks
    if (task.subTasksIds) {
        task.subTasksIds = task.subTasksIds.filter(id => checkIfTaskContainsResources(tasksMap[id], tasksMap, resourcesIds));
    }

    let doesTaskContainsResources = task.assignment && resourcesIds.indexOf(task.assignment.resourceId) >= 0;
    let doSubTasksContainResources = task.subTasksIds && task.subTasksIds.length;

    return doesTaskContainsResources || doSubTasksContainResources;
}