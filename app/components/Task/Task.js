import React from 'react';
import R from 'ramda';
import taskStyles from './Task.css';
import {view} from 'stores/configStore';
import moment from 'moment';

class Task extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: {}};
    }

    render() {
        var task = this.props.task;
        var width = view.dayWidth * task.leadTime;
        var startDate = moment(task.startDate)
        var subTasks;
        var color = [
            '#3498db',
            '#9b59b6',
            '#e67e22',
            '#c0392b',
            '#f1c40f',
            'orange',
            'green',
            'red'
        ]

        if (task.subTasks) {
            subTasks = task.subTasks.map(task => {
                // var daysOffset = (moment(task.startDate).milliseconds() - startDate.milliseconds()) / (24 * 60 * 60 * 1000);
                var daysOffset = task.offset;

                return <Task task={task} daysOffset={daysOffset} />
            });
        }

        return (
            <div key={task.id}>
                <div style={{width: width, marginLeft: this.props.daysOffset, backgroundColor: color[task.depth]}} className={taskStyles.test}>{task.id}</div>
                {subTasks}
            </div>
        );
    }
}

export default Task;
