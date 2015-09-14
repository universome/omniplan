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

        let tasks = [];
        for (let taskId in this.state.plan.tasks) {
            tasks.push(<Task task={this.state.plan.tasks[taskId]} />);
        }

        return (
            <div style={{position: 'relative'}}>
                <h1>Calendar</h1>
                <div className={calendarStyles.tasks}>{tasks}</div>
            </div>
        );
    }
}

function drawTask(task) {

    let subTasks =  [];
    if (task.subTasks) {
        for (let subTaskId in task.subTasks) {
            subTasks.push(drawTask(task.subTasks[subTaskId]));
        }
    }
    let styles = {
        position: 'absolute',
        top: (task.order * 20) + 'px',
        left: (task.offset * 10) + 'px',

        width: task.type === 'milestone' ? '20px' : (task.leadTime * 10) + 'px',
        height: '20px',

        // borderBottom: '1px solid red',
        fontSize: '12px',
        backgroundColor: task.type === 'milestone' ? 'green' : getBGCbyDepth(task.depth),
        border: '1px solid black',
        borderRadius: task.type === 'milestone' ? '50%' : 0,
        lineHeight: '20px',
        boxSizing: 'border-box'
    };

    return (
        <div key={task.id}>
            <p style={styles}>{task.id}, {task.effort}</p>
            {subTasks}
        </div>
    );
}

function getBGCbyDepth(depth) {
    let converter = [
        'black',
        '#34495e',
        '#9b59b6',
        '#3498db',
        '#2ecc71',
        '#1abc9c',
        '#e74c3c',
        '#f1c40f'
    ]

    return converter[depth];
}

export default Calendar;
