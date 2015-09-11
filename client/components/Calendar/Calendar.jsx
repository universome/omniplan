import React from 'react';
import PlanActions from 'actions/PlanActions';
import PlanStore from 'stores/PlanStore';
import R from 'ramda';

class Calendar extends React.Component {
    constructor() {
        super(arguments);
        this.state = {plan: {}};
    }

	componentDidMount() {
        PlanActions.fetchPlan();

        PlanStore.on('change', plan => this.setState({plan: plan}));
    }

    render() {

        let tasks = R.mapObj(drawTask, this.state.plan.tasks);

        return (
            <div>
                <h1>Calendar</h1>
                <div>{tasks}</div>
            </div>
        );
    }
}

function drawTask(task) {

    let subTasks = task.subTasks ? R.mapObj(drawTask, task.subTasks) : <p> No subTasks</p>;
    let styles = {
        position: 'absolute',
        top: (task.order * 50) + 'px',
        left: (task.offset * 20) + 'px',

        width: task.type === 'milestone' ? '50px' : (task.leadTime * 20) + 'px',
        // height: ((1/task.depth) * 50) + 'px',
        height: '50px',

        borderBottom: '1px solid red',
        color: 'white',
        backgroundColor: task.type === 'milestone' ? 'black' : getBGCbyDepth(task.depth)
    };

    return (
        <div style={styles}>
            <p>{task.title}</p>
            <div>{subTasks}</div>
        </div>
    );
}

function getBGCbyDepth(depth) {
    let converter = [
        '#3498db',
        '#9b59b6',
        '#e67e22',
        '#c0392b',
        '#f1c40f'
    ]

    return converter[depth];
}

export default Calendar;
