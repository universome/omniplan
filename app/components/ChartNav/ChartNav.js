import React from 'react';
import PlanStore from 'stores/PlanStore';
import SettingsStore from 'stores/SettingsStore';
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
        tasks = tasks.filter(task => task.depth === 1).map((task, i) => {
        	let number = (i+1).toString();
        	let isOpened = SettingsStore.get('openedTasks').indexOf(task.id) >= 0;
        	return <ChartNavTask task={task} plan={plan} number={number} key={task.id} isOpened={isOpened}/>;
        });

        return (
            <div className={chartNavStyles.chartNav}>{tasks}</div>
        );
    }
};

export default ChartNav;
