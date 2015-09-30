import AppDispatcher from 'AppDispatcher';

class SettingsActionsClass {
	openTask(taskId) {
		AppDispatcher.dispatch({actionType: 'task:open', taskId: taskId});
	}

	closeTask(taskId) {
		AppDispatcher.dispatch({actionType: 'task:close', taskId: taskId});
	}

	resetSetting(settingName) {
		AppDispatcher.dispatch({actionType: 'setting:reset', settingName: settingName});	
	}
}

export default new SettingsActionsClass();
