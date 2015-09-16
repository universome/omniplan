import React from 'react';
import R from 'ramda';
import PlanStore from 'stores/PlanStore';
import taskStyles from './ChartContentTask.css';
import {view} from 'stores/ConfigStore';
import moment from 'moment';

class ChartContentTask extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: {}};
    }

    render() {
        let task = this.props.task;
        let startDate = moment(task.startDate)
        let subTasks = task.subTasksIds ? task.subTasksIds.map(id => PlanStore.tasksMap[id]) : [];
        let styles = {
            width: view.dayWidth * task.leadTime,
            height: view.taskHeight + 'px',
            marginLeft: task.offset * view.dayWidth,
            borderRadius: view.taskHeight + 'px',
            backgroundColor: getBGCByTask(task)
        }

        subTasks = subTasks.map(subTask => <ChartContentTask task={subTask} key={subTask.id} />);

        return (
            <div>
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

export default ChartContentTask;
