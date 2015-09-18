import AppDispatcher from 'AppDispatcher';
import $ from 'jquery';

var _planLastFetchTime = 0;

class PlanActionsClass {

    fetchPlan() {
        if ( (Date.now() - _planLastFetchTime) < (10 * 60 * 1000) ) {
            return; // Do not fetch projects every time we visit the page
        }

        $
            .getJSON(config.API_URL + '/getPlan')
            .fail(console.warn.bind(console))
            .success(plan => {
                AppDispatcher.dispatch({actionType: 'plan:fetch', plan: plan});
                _planLastFetchTime = Date.now();
            });
    }

    resetFilters(filter) {
        AppDispatcher.dispatch({actionType: 'plan:filter:reset'});
    }

    applyFilter(filter) {
        AppDispatcher.dispatch({actionType: 'plan:filter', filter: filter});
    }
}

export default new PlanActionsClass();
