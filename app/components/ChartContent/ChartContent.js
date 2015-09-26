import React from 'react';
import PlanActions from 'actions/PlanActions';
import PlanStore from 'stores/PlanStore';
import ChartContentTask from 'components/ChartContentTask';
import ChartContentGrid from 'components/ChartContentGrid';
import chartContentStyles from './ChartContent.css';
import getEndDateByPlan from 'helpers/getEndDateByPlan';
import getStartDateByPlan from 'helpers/getStartDateByPlan';
import SettingsStore from 'stores/SettingsStore';

class ChartContent extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
    	let tasks;
        let plan = this.props.plan;
        let planWidth = getEndDateByPlan(plan).diff( getStartDateByPlan(plan), 'days' ) * SettingsStore.get('dayWidth') + 'px';

        tasks = plan && plan.tasks ? plan.tasks : [];
        tasks = tasks.filter(task => task.depth === 1).map(task => <ChartContentTask task={task} plan={plan} key={task.id}/>);

        return (
            <div className={chartContentStyles.chartContent}>
                <ChartContentGrid plan={this.props.plan} />
                <div className={chartContentStyles.chartContentTasks} style={{width: planWidth}}>{tasks}</div>
            </div>
        );
    }
}

export default ChartContent;