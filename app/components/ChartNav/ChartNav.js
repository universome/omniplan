import React from 'react';
import PlanStore from 'stores/PlanStore';
import chartNavStyles from './ChartNav.css';
import ChartNavTask from 'components/ChartNavTask';

class ChartNav extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: PlanStore.getPlan()};
    }

    componentDidMount() {
        PlanStore.on('change', plan => this.setState({plan}));
    }

    render() {

        let tasks;
        tasks = this.state.plan && this.state.plan.tasks ? this.state.plan.tasks : [];
        tasks = tasks.filter(task => task.depth === 1).map(task => <ChartNavTask task={task} key={task.id}/>);

        return (
            <div className={chartNavStyles.chartNav}>{tasks}</div>
        );
    }
};

export default ChartNav;
