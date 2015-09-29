import React from 'react';
import moment from 'moment';
import PlanStore from 'stores/PlanStore';
import SettingsStore from 'stores/SettingsStore';
import TaskDetailsStyles from './TaskDetails.css';

class TaskDetails extends React.Component {
	constructor(...args) {
		super(args);
	}

	componentDidMount() {
		SettingsStore.on('lastOpenedTask:change', () => this.setState({ taskId: SettingsStore.get('lastOpenedTask') }));
	}

	render() {
		if (!this.state || !this.state.taskId) return <div />;

		let taskId = this.state.taskId;
		let plan = PlanStore.getPlan();
		let task = plan.tasksMap[taskId];
		
		let details = [
			{key: '', value: `${moment(task.startDate).format('DD.MM.YYYY')} – ${moment(task.endDate).format('DD.MM.YYYY')}`},
			{key: '', value: task.title},
			{key: '', value: task.assignment ? plan.resourcesMap[task.assignment.resourceId].name : null},
			{key: '', value: task.note ? task.note.text : null},
		]
		
		details = details
			.concat( task.userDataList ? task.userDataList : [] )
			.filter(d => d.value)
			.map((data, i) => <TaskDetail data={data} key={i}/>);

		return (
			<div className={TaskDetailsStyles.Container}>
				<div className={TaskDetailsStyles.Details}>
					<div className={TaskDetailsStyles.Detail}>{details}</div>
				</div>
			</div>
		);
	}
}

class TaskDetail extends React.Component {
	constructor(...args) {
		super(args);
	}

	render() {
		let key = this.props.data.key;
		let value = this.props.data.value;

		if (isURL(value)) value = <a href={value} target={'_blank'}>link</a>;

		return (
			<div className={TaskDetailsStyles.TaskDetail}>{key + (key ? ' - ' : '')}{value}</div>
		);
	}
}

// Ultra complex url validator
function isURL(str) {
	return str.slice(0,4) === 'http';
}

export default TaskDetails;