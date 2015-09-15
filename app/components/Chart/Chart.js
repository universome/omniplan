import React from 'react';
import PlanActions from 'actions/PlanActions';
import PlanStore from 'stores/PlanStore';
import Task from 'components/Task';
import R from 'ramda';
import chartStyles from './Chart.css'

class Chart extends React.Component {
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
        tasks = tasks.filter(task => task.depth === 1).map(task => <Task task={task} />);

        return (
            <div style={{position: 'relative'}}>
                <div className={chartStyles.tasks}>{tasks}</div>
            </div>
        );
    }
}

export default Chart;
