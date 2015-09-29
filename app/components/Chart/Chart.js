import React from 'react';
import ChartContent from 'components/ChartContent';
import ChartNav from 'components/ChartNav';
import ChartSuggest from 'components/ChartSuggest';
import ChartStyles from './Chart.css';
import PlanStore from 'stores/PlanStore';
import PlanActions from 'actions/PlanActions';

class Chart extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: {}, filteredPlan: {}};
    }

    componentDidMount() {
        PlanStore.on('change', () => this.setState({ 
            plan: PlanStore.getPlan(),
            filteredPlan: PlanStore.getFilteredPlan()
        }));
        
        PlanActions.fetchPlan();
    }

    render() {
        return (
        	<div>
        		<ChartSuggest plan={this.state.plan} />
	            <div className={ChartStyles.Chart}>
	                <ChartNav plan={this.state.filteredPlan}/>
	                <ChartContent plan={this.state.filteredPlan}/>
	            </div>
        	</div>
        );
    }
};

export default Chart;
