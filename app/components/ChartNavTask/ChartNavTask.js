import React from 'react';
import {view} from 'stores/ConfigStore';
import ChartNavTaskStyles from './ChartNavTask.css';

class ChartNavTask extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let task = this.props.task;
        let plan = this.props.plan;
        let number = this.props.number;
        let subTasks = task.subTasksIds ? task.subTasksIds.map(id => plan.tasksMap[id]) : [];
        let styles = {
            marginLeft: task.depth * view.dayWidth + 'px',
            height: view.taskHeight + 'px',
            lineHeight: view.taskHeight + 'px'
        };

        subTasks = subTasks.map((subTask, i) => <ChartNavTask task={subTask} plan={plan} number={number + '.' + (i+1).toString()} key={subTask.id}/>)

        return (
            <div>
                <div style={styles} className={ChartNavTaskStyles.ChartNavTask}>
                    {number + ') '}
                    {task.title}
                </div>
                <div>{subTasks}</div> 
            </div>
        );
    }
}

export default ChartNavTask;
