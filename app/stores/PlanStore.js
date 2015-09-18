import EventEmitter from 'events';
import moment from 'moment';
import AppDispatcher from 'AppDispatcher';
import createMapFromArray from 'helpers/createMapFromArray';

class PlanStoreClass extends EventEmitter {

    constructor() {
        super();
        this._plan = {};
    }

    getPlan() {
        return this._plan;
    }

    setPlan(plan) {
        this._plan = plan || {};
        this.tasksMap = this._plan.tasks ? createMapFromArray('id', this._plan.tasks) : {};
        this.resourcesMap = this._plan.resources ? createMapFromArray('id', this._plan.resources) : {};
        this.emit('change', this.getPlan());
    }

    getEndDate() {
        if (!this._plan || !this._plan.tasks) return moment();
        // let latestTask = this._plan.tasks.reduce( (prevTask, currTask) => moment(prevTask.endDate).isAfter( moment(currTask.endDate) ) ? moment(prevTask.endDate) : moment(currTask.endDate));
        return moment(this._plan.tasks[0].endDate);
    }
}

let PlanStore = new PlanStoreClass();

AppDispatcher.register(function(payload) {
    if (payload.actionType === 'plan:fetch') {
        PlanStore.setPlan(payload.plan);
    }
});

export default PlanStore;
