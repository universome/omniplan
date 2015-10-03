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

		let styles = {
			paddingLeft: task.depth * SettingsStore.get('dayWidth') + 'px',
			height: SettingsStore.get('taskHeight') + 'px',
			lineHeight: SettingsStore.get('taskHeight') + 'px'
		};

		return (
			<div className={task.isOpened ? ChartNavTaskStyles.Opened : ''}>
				<div style={styles} className={ChartNavTaskStyles.Task}>
					<div onClick={this.toggle.bind(this)} className={ChartNavTaskStyles.TaskTitle}>{`${task.number}) ${task.title}`}</div>
				</div>
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

export default ChartNavTask;
