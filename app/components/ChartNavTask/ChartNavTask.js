import React from 'react';
import PlanStore from 'stores/PlanStore';
import {view} from 'stores/ConfigStore';
import ChartNavTaskStyles from './ChartNavTask.css';

class ChartNavTask extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let task = this.props.task;
        let subTasks = task.subTasksIds ? task.subTasksIds.map(id => PlanStore.tasksMap[id]) : [];
        let styles = {
            marginLeft: task.depth * view.dayWidth + 'px',
            height: view.taskHeight + 'px',
            lineHeight: view.taskHeight + 'px'
        };

        subTasks = subTasks.map(subTask => <ChartNavTask task={subTask} key={subTask.id}/>)

        return (
            <div>
                <div style={styles} className={ChartNavTaskStyles.ChartNavTask}>{task.title}</div>
                <div>{subTasks}</div> 
            </div>
        );
    }
}

export default ChartNavTask;
