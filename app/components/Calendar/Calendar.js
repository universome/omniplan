import React from 'react';
import PlanActions from 'actions/PlanActions';
import PlanStore from 'stores/PlanStore';
import Task from 'components/Task';
import R from 'ramda';
import calendarStyles from './Calendar.css'

class Calendar extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: {}};
    }

	componentDidMount() {
        PlanStore.on('change', plan => this.setState({plan: plan}));

        PlanActions.fetchPlan();
    }

    render() {

        let tasks = this.state.plan.tasks ? this.state.plan.tasks.map(task => <Task task={task} />) : [];
        // let tasks = this.state.plan.tasks ? this.state.plan.tasks.map(drawTask) : [];

        return (
            <div style={{position: 'relative'}}>
                <h1>Calendar</h1>
                <div className={calendarStyles.tasks}>{tasks}</div>
            </div>
        );
    }
}

export default Calendar;
