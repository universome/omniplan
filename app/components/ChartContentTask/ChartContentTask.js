import React from 'react';
import R from 'ramda';
import moment from 'moment';
import SettingsStore from 'stores/SettingsStore';
import SettingsActions from 'actions/SettingsActions';
import ChartContentTaskArrow from 'components/ChartContentTaskArrow';
import ChartContentTaskStyles from './ChartContentTask.css';

class ChartContentTask extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let task = this.props.task;
        let plan = this.props.plan;
        let resourceName = task.assignment ? plan.resourcesMap[task.assignment.resourceId].name : '';
        let startDate = moment(task.startDate);
        let subTasks = task.subTasksIds && task.isOpened ? task.subTasksIds.map(id => plan.tasksMap[id]) : []; // Ultra optimization: do not draw subTasks if parent task is not opened!
        let depArrows = task.depTasksIds ? task.depTasksIds.filter(id => plan.tasksMap[id]).map(id => {return { fromTask: plan.tasksMap[id], toTask: task }}) : [];
        let effortDonePercents = Math.round((task.effortDone / task.effort) * 100) || 0;
        let blue = '#3498db';
        let green = '#40d47e';
        let taskStyles = {
            width: SettingsStore.get('dayWidth') * task.leadTime,
            height: 0.9 * SettingsStore.get('taskHeight') + 'px', // Multiply on 0.9 (decrease actual height) to add some marginBottom :|
            marginBottom: 0.1 * SettingsStore.get('taskHeight') + 'px',
            marginLeft: task.offset * SettingsStore.get('dayWidth') + 'px',
            // top: task.position * SettingsStore.get('taskHeight') + 'px',
            borderRadius: SettingsStore.get('taskHeight') + 'px',
            background: `linear-gradient(to right, ${green} 0%, ${green} ${effortDonePercents}%, ${blue} ${effortDonePercents}%, ${blue} 100%)`
        }

        let resourceNameStyles = {
        	height: SettingsStore.get('taskHeight') + 'px',
        	lineHeight: SettingsStore.get('taskHeight') + 'px'
        }

        subTasks = subTasks.map(subTask => <ChartContentTask task={subTask} plan={plan} key={subTask.id} />);
        depArrows = depArrows.map(depArrow => <ChartContentTaskArrow fromTask={depArrow.fromTask} toTask={depArrow.toTask} key={depArrow.fromTask.id}/>);

        return (
            <div>
                <div style={taskStyles} className={`${ChartContentTaskStyles.Task} ${(task.isOpened ? ChartContentTaskStyles.Opened : '')}`} onClick={this.toggle.bind(this)}>
                	<div className={ChartContentTaskStyles.ResourceName} style={resourceNameStyles}>{resourceName}</div>
                </div>
                <div className={ChartContentTaskStyles.SubTasks} style={{visibility:task.isOpened ? 'visible' : 'hidden'}}>{subTasks}</div>
                {depArrows}
            </div>
        );
    }

    toggle() {
    	if (this.props.task.isOpened) {
    		SettingsActions.closeTask(this.props.task.id);
    	} else {
    		SettingsActions.openTask(this.props.task.id);
    	}
    }
}

export default ChartContentTask;
