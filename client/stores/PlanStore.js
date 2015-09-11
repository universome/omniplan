import EventEmitter from "events";
import AppDispatcher from "AppDispatcher";

class PlanStoreClass extends EventEmitter {

    constructor() {
        super();
        this._plan = {};
    }

    getPlan() {
        return this._plan;
    }

    setPlan(plan) {
        this._plan = plan;
        this.emit('change', this.getPlan());
    }
}

var PlanStore = new PlanStoreClass();

AppDispatcher.register(function(payload) {
    if (payload.actionType === "plan:fetch") {
        PlanStore.setPlan(payload.plan);
    }
});

export default PlanStore;
