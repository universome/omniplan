export default function calculateTasksPositions(tasks, tasksMap, _processedTasks, _counter, _shouldIncrement) {

    let processedTasks = _processedTasks || {};
    let counter = _counter || {position: 0};
    let shouldIncrement = _shouldIncrement || false;

    tasks.forEach(task => {
    	if (processedTasks[task.id]) return;

        task.position = counter.position + 1;
        processedTasks[task.id] = true;
        
        if (shouldIncrement) counter.position += 1;

        // Subtasks should go immidiately after their parent
        if (task.subTasksIds) {
        	let subTasks = task.subTasksIds.map(id => tasksMap[id]);
        	calculateTasksPositions(subTasks, tasksMap, processedTasks, counter, task.isOpened);
        }
    });
}
