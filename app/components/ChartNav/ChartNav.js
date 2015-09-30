import React from 'react';
import PlanStore from 'stores/PlanStore';
import SettingsStore from 'stores/SettingsStore';
import ChartNavStyles from './ChartNav.css';
import ChartNavTask from 'components/ChartNavTask';

class ChartNav extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {

        let tasks;
        let plan = this.props.plan;
        let style = {marginTop: SettingsStore.get('chartGridHeaderHeight') + 'px'}
        tasks = plan && plan.tasks ? plan.tasks : [];
        tasks = tasks.filter(task => task.depth === 1).map((task, i) => <ChartNavTask task={task} plan={plan} number={(i+1).toString()} key={task.id}/>);

        return (
            <div className={ChartNavStyles.Nav} style={style}>
            	<div className={ChartNavStyles.Task}>{tasks}</div>
            </div>
        );
    }
};

export default ChartNav;
