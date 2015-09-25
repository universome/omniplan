import React from 'react';
import R from 'ramda';
import ChartContentTaskStyles from './ChartContentTask.css';
import {view} from 'stores/ConfigStore';
import moment from 'moment';
import ChartContentTaskArrow from 'components/ChartContentTaskArrow';

class ChartContentTask extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let task = this.props.task;
        let plan = this.props.plan;
        let resourceName = task.assignment ? plan.resourcesMap[task.assignment.resourceId].name : '';
        let startDate = moment(task.startDate);
        let subTasks = task.subTasksIds ? task.subTasksIds.map(id => plan.tasksMap[id]) : [];
        let depArrows = task.depTasksIds ? task.depTasksIds.map(id => {return { fromTask: plan.tasksMap[id], toTask: task }}) : [];
        let effortDonePercents = Math.round((task.effortDone / task.effort) * 100) || 0;
        let blue = '#3498db';
        let green = '#40d47e';
        let styles = {
            width: view.dayWidth * task.leadTime,
            height: view.taskHeight + 'px',
            left: task.offset * view.dayWidth + 'px',
            top: task.order * view.taskHeight + 'px',
            borderRadius: view.taskHeight + 'px',
            background: `linear-gradient(to right, ${green} 0%, ${green} ${effortDonePercents}%, ${blue} ${effortDonePercents}%, ${blue} 100%)`
        }

        subTasks = subTasks.map(subTask => <ChartContentTask task={subTask} plan={plan} key={subTask.id} />);
        depArrows = depArrows.map(depArrow => <ChartContentTaskArrow fromTask={depArrow.fromTask} toTask={depArrow.toTask} key={depArrow.fromTask.id}/>);

        return (
            <div>
                <div style={styles} className={ChartContentTaskStyles.Task}>
                	<div className={ChartContentTaskStyles.ResourceName}>{resourceName}</div>
                </div>
                <div className={ChartContentTaskStyles.subTasks}>{subTasks}</div>
                {depArrows}
            </div>
        );
    }
}

export default ChartContentTask;
