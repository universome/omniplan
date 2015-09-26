import AppDispatcher from 'AppDispatcher';

class SettingsActionsClass {
	openTask(taskId) {
		AppDispatcher.dispatch({actionType: 'task:open', taskId: taskId});
	}

	closeTask(taskId) {
		AppDispatcher.dispatch({actionType: 'task:close', taskId: taskId});
	}
}

export default new SettingsActionsClass();
