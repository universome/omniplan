import EventEmitter from 'events';
import moment from 'moment';
import R from 'ramda';
import AppDispatcher from 'AppDispatcher';
import SettingsStore from 'stores/SettingsStore';
import createMapFromArray from 'helpers/createMapFromArray';
import checkIfTaskContainsResources from 'helpers/checkIfTaskContainsResources';
import calculateTasksPositions from 'helpers/calculateTasksPositions';

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

    	if (this._lastFiltersUpdateTime < this._lastFilteredPlanCalculationTime) return this._filteredPlan;

        let plan = this.getPlan();
        let chosenResourceIds = this._taskFilters.map(filter => filter.value);
        this._lastFilteredPlanCalculationTime = Date.now();
        
        if (!chosenResourceIds.length) return plan;
        
        this._filteredPlan = R.clone(plan);
        this._filteredPlan.tasksMap = createMapFromArray('id', this._filteredPlan.tasks) || {};
        this._filteredPlan.resourcesMap = createMapFromArray('id', this._filteredPlan.resources) || {};
        this._filteredPlan.tasks = this._filteredPlan.tasks.filter(task => checkIfTaskContainsResources(task, this._filteredPlan.tasksMap, chosenResourceIds));
        calculateTasksPositions(this._filteredPlan.tasks, this._filteredPlan.tasksMap);
        
        return this._filteredPlan;
    }

    setPlan(plan) {
        this._plan = plan || {};
        this._plan.tasksMap = this._plan.tasks ? createMapFromArray('id', this._plan.tasks) : {};
        this._plan.resourcesMap = this._plan.resources ? createMapFromArray('id', this._plan.resources) : {};
        this._lastFiltersUpdateTime = Date.now();
        this._filteredPlan = this.getFilteredPlan();
        this.updateTasksPositions();
        this.emit('change');
    }

    addTaskFilter(filter) {
        this._taskFilters.push(filter);
        this._lastFiltersUpdateTime = Date.now();
        this.emit('change');
    }

    removeTaskFilter() {
        this._taskFilters = [];
        this._lastFiltersUpdateTime = Date.now();
        this.emit('change');
    }

    resetTaskFilters() {
        this._taskFilters = [];
        this._lastFiltersUpdateTime = Date.now();
        this.emit('change');
    }

    updateTasksPositions() {
    	let plan = this.getPlan();
    	let filteredPlan = this.getFilteredPlan();
    	let openedTasks = SettingsStore.get('openedTasks');

    	plan.tasks.forEach(task => { task.isOpened = openedTasks.indexOf(task.id) >= 0 });
    	filteredPlan.tasks.forEach(task => { task.isOpened = openedTasks.indexOf(task.id) >= 0 });

    	calculateTasksPositions(plan.tasks, plan.tasksMap);
    	calculateTasksPositions(filteredPlan.tasks, filteredPlan.tasksMap);

        this.emit('change');
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

    if (payload.actionType === 'task:open' || payload.actionType === 'task:close') {
    	AppDispatcher.waitFor([SettingsStore.dispatchToken]);
    	PlanStore.updateTasksPositions();
    }
});

export default PlanStore;

