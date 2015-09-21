import React from 'react';
import PlanStore from 'stores/PlanStore';
import chartNavStyles from './ChartNav.css';
import ChartNavTask from 'components/ChartNavTask';

class ChartNav extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {

        let tasks;
        let plan = this.props.plan;
        tasks = plan && plan.tasks ? plan.tasks : [];
        tasks = tasks.filter(task => task.depth === 1).map((task, i) => <ChartNavTask task={task} plan={plan} number={(i+1).toString()} shouldShowDetails={true} key={task.id}/>);

        return (
            <div className={chartNavStyles.chartNav}>{tasks}</div>
        );
    }
};

export default ChartNav;
