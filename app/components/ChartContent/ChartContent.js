import React from 'react';
import PlanActions from 'actions/PlanActions';
import PlanStore from 'stores/PlanStore';
import ChartContentTask from 'components/ChartContentTask';
import ChartContentGrid from 'components/ChartContentGrid';
import chartContentStyles from './ChartContent.css';

class ChartContent extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: {}};
    }

    componentDidMount() {
        PlanStore.on('change', plan => this.setState({plan: plan}));
        PlanActions.fetchPlan();
    }

    render() {
    	
    	let tasks;
        tasks = this.state.plan && this.state.plan.tasks ? this.state.plan.tasks : [];
        tasks = tasks.filter(task => task.depth === 1).map(task => <ChartContentTask task={task} key={task.id}/>);

        return (
            <div className={chartContentStyles.chartContent}>
                <ChartContentGrid />
                <div className={chartContentStyles.chartContentTasks}>{tasks}</div>
            </div>
        );
    }
}

export default ChartContent;