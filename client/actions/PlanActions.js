import AppDispatcher from 'AppDispatcher';
import reqwest from 'reqwest';

var _planLastFetchTime = 0;

class PlanActionsClass {

    fetchPlan() {
        if ( (Date.now() - _planLastFetchTime) < (10 * 60 * 1000) ) {
            return; // Do not fetch projects every time we visit the page
        }

		reqwest({
            url: config.API_URL + '/getPlan',
            crossOrigin: true,
            success: plan => {
    			AppDispatcher.dispatch({actionType: 'plan:fetch', plan: plan});
    			_planLastFetchTime = Date.now();
    		},
            error: console.warn.bind(console)
        });
    }
}

export default new PlanActionsClass();
