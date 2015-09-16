import React from 'react';
import PlanStore from 'stores/PlanStore';

class ChartNavTask extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let task = this.props.task;
        let subTasks = task.subTasksIds ? task.subTasksIds.map(id => PlanStore.tasksMap[id]) : [];
        let styles = {
            marginLeft: task.depth * 10 + 'px',
            fontSize: '12px'
        };

        subTasks = subTasks.map(subTask => <ChartNavTask task={subTask} key={subTask.id}/>)

        return (
            <div>
                <div style={styles}>{task.id}</div>
                <div>{subTasks}</div> 
            </div>
        );
    }
}

export default ChartNavTask;
