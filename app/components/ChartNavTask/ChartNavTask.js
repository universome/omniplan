import React from 'react';
import moment from 'moment';
import SettingsStore from 'stores/SettingsStore';
import SettingsActions from 'actions/SettingsActions';
import ChartNavTaskStyles from './ChartNavTask.css';

class ChartNavTask extends React.Component {
	constructor(...args) {
		super(args);
	}

	render() {
		let task = this.props.task;
		let plan = this.props.plan;
		let number = this.props.number;
		let subTasks = task.subTasksIds && task.isOpened ? task.subTasksIds.map(id => plan.tasksMap[id]) : []; // Ultra optimization: do not draw subTasks if parent task is not opened!
		let details = [];
		let styles = {
			paddingLeft: task.depth * SettingsStore.get('dayWidth') + 'px',
			height: SettingsStore.get('taskHeight') + 'px',
			lineHeight: SettingsStore.get('taskHeight') + 'px'
		};

		subTasks = subTasks.map((subTask, i) => <ChartNavTask task={subTask} plan={plan} number={number + '.' + (i+1).toString()} key={subTask.id}/>);
		
		if (task.isOpened) {
			details.push(`${moment(task.startDate).format('DD MM YYYY')} - ${moment(task.endDate).format('DD MM YYYY')}`);
			details.push(task.assignment ? plan.resourcesMap[task.assignment.resourceId].name : ' – ');
			details.push(task.note ? task.note.text : ' – ');
			details.push(task.userData ? task.userData.map((userData, i) => <ChartNavTaskUserData data={userData} key={i}/>) : ' – ');
		}

		return (
			<div className={task.isOpened ? ChartNavTaskStyles.Opened : ''}>
				<div style={styles} className={ChartNavTaskStyles.ChartNavTask}>
					<div onClick={this.toggle.bind(this)} className={ChartNavTaskStyles.ChartNavTaskTitle}>{`${number}) ${task.title}`}</div>
					{details.map((detail, i) => <ChartNavTaskDetails content={detail} key={i}/>)}
				</div>
				<div className={ChartNavTaskStyles.SubTasks}>{subTasks}</div>
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


class ChartNavTaskDetails extends React.Component {
	constructor(...args) {
		super(args);
	}

	render() {
		return (
			<div className={ChartNavTaskStyles.ChartNavTaskDetails}>{this.props.content}</div>
		);
	}
}

class ChartNavTaskUserData extends React.Component {
	constructor(...args) {
		super(args);
	}

	render() {
		let key = this.props.data.key;
		let value = this.props.data.value;
		if (isURL(value)) value = <a href={value} target={'_blank'}>Ссылка</a>; // Ultra-link-check

		return (
			<div className={ChartNavTaskStyles.ChartNavTaskUserData}>{key + ' – '}{value}</div>
		);
	}
}

// Ultra complex url validator
function isURL(str) {
	return str.slice(0,4) === 'http';
}

export default ChartNavTask;
