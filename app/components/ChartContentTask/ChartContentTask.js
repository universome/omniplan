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
            borderRadius: view.taskHeight + 'px'
        }

        subTasks = subTasks.map(subTask => <ChartContentTask task={subTask} key={subTask.id} />);

        return (
            <div>
                <div style={styles} className={taskStyles.task} />
                <div className={taskStyles.subTasks}>{subTasks}</div> 
            </div>
        );
    }
}

export default ChartContentTask;
