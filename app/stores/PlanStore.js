import EventEmitter from 'events';
import moment from 'moment';
import R from 'ramda';
import AppDispatcher from 'AppDispatcher';
import createMapFromArray from 'helpers/createMapFromArray';

class PlanStoreClass extends EventEmitter {

    constructor() {
        super();
        this._plan = {};
        this._taskFilters = [];
    }

    getPlan() {
        return this._plan;
    }

    getFilteredPlan() {
        let plan = this.getPlan();
        let chosenResourceIds = this._taskFilters.map(filter => filter.value);
        
        if (!chosenResourceIds.length) return plan;
        
        let filteredPlan = R.clone(plan);
        filteredPlan.tasksMap = createMapFromArray('id', filteredPlan.tasks) || {};
        filteredPlan.resourcesMap = createMapFromArray('id', filteredPlan.tasks) || {};

        filteredPlan.tasks = filteredPlan.tasks.filter(task => checkIfTaskContainsResources(task, filteredPlan.tasksMap, chosenResourceIds));
        
        return filteredPlan;
    }

    setPlan(plan) {
        this._plan = plan || {};
        this._plan.tasksMap = this._plan.tasks ? createMapFromArray('id', this._plan.tasks) : {};
        this._plan.resourcesMap = this._plan.resources ? createMapFromArray('id', this._plan.resources) : {};
        this.emit('change');
    }

    addTaskFilter(filter) {
        this._taskFilters.push(filter);
        this.emit('change');
    }

    removeTaskFilter() {
        this._taskFilters = [];
        this.emit('change');
    }

    resetTaskFilters() {
        this._taskFilters = [];
        this.emit('change');
    }
}

let PlanStore = new PlanStoreClass();

AppDispatcher.register(function(payload) {
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

export default PlanStore;

function checkIfTaskContainsResources(task, tasksMap, resourcesIds) {

    // First, recoursively filter all subtasks
    if (task.subTasksIds) {
        task.subTasksIds = task.subTasksIds.filter(id => checkIfTaskContainsResources(tasksMap[id], tasksMap, resourcesIds));
    }

    let doesTaskContainsResources = task.assignment && resourcesIds.indexOf(task.assignment.resourceId) >= 0;
    let doSubTasksContainResources = task.subTasksIds && task.subTasksIds.length;

    return doesTaskContainsResources || doSubTasksContainResources;
}
