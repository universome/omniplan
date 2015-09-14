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
        let task = this.props.task;
        let width = view.dayWidth * task.leadTime;
        let startDate = moment(task.startDate)
        let subTasks;
        let styles = {
            width: width,
            marginLeft: this.props.daysOffset,
            // borderRadius: view.dayWidth * 2 + 'px',
            backgroundColor: getBGCByTask(task)
        }

        if (task.subTasks) {
            subTasks = task.subTasks.map(task => {
                // var daysOffset = (moment(task.startDate).milliseconds() - startDate.milliseconds()) / (24 * 60 * 60 * 1000);
                let daysOffset = task.offset * view.dayWidth;
                return <Task task={task} daysOffset={daysOffset} />
            });
        }



        return (
            <div key={task.id}>
                <div style={styles} className={taskStyles.task}>{task.id}</div>
                <div className={taskStyles.subTasks}>{subTasks}</div> 
            </div>
        );
    }
}

function getBGCByTask(task) {
    let depthToColor = [
        'black',
        '#34495e',
        '#9b59b6',
        '#3498db',
        '#2ecc71',
        '#e74c3c',
        '#f1c40f'
    ]

    let color = task.type !== 'milestone' ? depthToColor[task.depth] : 'black';

    return color;
}

function getOffsetByStartDate(startDate) {

}

export default Task;
