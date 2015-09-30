import EventEmitter from 'events';
import moment from 'moment';
import R from 'ramda';
import AppDispatcher from 'AppDispatcher';
import SettingsStore from 'stores/SettingsStore';
import createMapFromArray from 'helpers/createMapFromArray';

class PlanStoreClass extends EventEmitter {

    constructor() {
        super();
        
        this._plan = {};
        this._filteredPlan = {};
        this._taskFilters = [];
        this._lastFiltersUpdateTime = NaN;
        this._lastFilteredPlanCalculationTime = NaN;
    }

    getPlan() {
        return this._plan;
    }

    getFilteredPlan() {

    	if (this._lastFiltersUpdateTime <= this._lastFilteredPlanCalculationTime) return this._filteredPlan;

        let plan = this.getPlan();
        let chosenResourceIds = this._taskFilters.map(filter => filter.value); // We can filter only by resource id

        this._lastFilteredPlanCalculationTime = Date.now();
        this._filteredPlan = R.clone(plan);
        
        if (!chosenResourceIds.length) return this._filteredPlan;
        
        this._filteredPlan.tasks = this._filteredPlan.tasks.filter(task => checkIfTaskContainsResources(task, this._filteredPlan.tasksMap, chosenResourceIds));
        this._filteredPlan.tasksMap = createMapFromArray('id', this._filteredPlan.tasks) || {};
        this._filteredPlan.resourcesMap = createMapFromArray('id', this._filteredPlan.resources) || {};
        calculateTasksPositions(this._filteredPlan.tasks, this._filteredPlan.tasksMap);

        return this._filteredPlan;
    }

    setPlan(plan) {
        this._plan = plan || {};
        this._plan.tasksMap = this._plan.tasks ? createMapFromArray('id', this._plan.tasks) : {};
        this._plan.resourcesMap = this._plan.resources ? createMapFromArray('id', this._plan.resources) : {};
        this.updateTasksPositions(this.getPlan());
        
        setNumbersToTasks(this._plan.tasks.filter(t => t.depth === 1), this._plan.tasksMap);
        
        this._lastFiltersUpdateTime = Date.now();
        this._filteredPlan = this.getFilteredPlan();
        this.updateTasksPositions(this._filteredPlan);
        
        this.emit('change');
    }

    addTaskFilter(filter) {
        this._taskFilters.push(filter);
        this._lastFiltersUpdateTime = Date.now();
        this.emit('change');
    }

    resetTaskFilters() {
        this._taskFilters = [];
        this._lastFiltersUpdateTime = Date.now();
        this.emit('change');
    }

    updateTasksPositions(plan) {
    	let openedTasks = SettingsStore.get('openedTasks');
    	
    	plan.tasks.forEach(task => { task.isOpened = openedTasks.indexOf(task.id) >= 0 });
    	calculateTasksPositions(plan.tasks, plan.tasksMap);
    	plan.tasks.sort((t1, t2) => t1.position - t2.position);
    }
}

let PlanStore = new PlanStoreClass();

PlanStore.dispatchToken = AppDispatcher.register((payload) => {
    if (payload.actionType === 'plan:fetch') {
        PlanStore.setPlan(payload.plan);
    }

    if (payload.actionType === 'plan:filter') {
        PlanStore.addTaskFilter(payload.filter);
    }

    if (payload.actionType === 'plan:filter:reset') {
        PlanStore.resetTaskFilters();
    }
});

/* Is it very bad to subscribe from one to store to changes from another? */
SettingsStore.on('openedTasks:change', function() {
	PlanStore.updateTasksPositions( PlanStore.getPlan() );
	PlanStore.updateTasksPositions( PlanStore.getFilteredPlan() );
	PlanStore.emit('change');
});

export default PlanStore;

/* 
	HELPERS!
	I did not moved them to [helpers] folder, because they are not common)
*/
function checkIfTaskContainsResources(task, tasksMap, resourcesIds) {

    // First, recoursively filter all subtasks
    if (task.subTasksIds) {
        task.subTasksIds = task.subTasksIds.filter(id => checkIfTaskContainsResources(tasksMap[id], tasksMap, resourcesIds));
    }

    let doesTaskContainsResources = task.assignment && resourcesIds.indexOf(task.assignment.resourceId) >= 0;
    let doSubTasksContainResources = task.subTasksIds && task.subTasksIds.length;

    return doesTaskContainsResources || doSubTasksContainResources;
}

function calculateTasksPositions(tasks, tasksMap, _processedTasks, _counter, _shouldIncrement) {

    let processedTasks = _processedTasks || {};
    let counter = _counter || {position: -1};
    let shouldIncrement = _shouldIncrement !== undefined ? _shouldIncrement : true;

    tasks.forEach(task => {
    	if (processedTasks[task.id]) return;

        task.position = counter.position + 1;
        processedTasks[task.id] = true;
        
        if (shouldIncrement) counter.position += 1;

        // Subtasks should go immidiately after their parent
        if (task.subTasksIds) {
        	let subTasks = task.subTasksIds.map(id => tasksMap[id]);
        	calculateTasksPositions(subTasks, tasksMap, processedTasks, counter, task.isOpened && shouldIncrement);
        }
    });
}

function setNumbersToTasks(tasks, tasksMap, _number) {
	tasks.forEach((task, i) => {
		task.number = _number ? _number + '.' + (i + 1) : (i + 1);

		if (task.subTasksIds) {
			setNumbersToTasks(task.subTasksIds.map(id => tasksMap[id]), tasksMap, task.number);
		}
	});
}
