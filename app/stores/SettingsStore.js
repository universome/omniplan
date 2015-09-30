import R from 'ramda';
import EventEmitter from 'events';
import AppDispatcher from 'AppDispatcher';

class SettingsStoreClass extends EventEmitter {

	static get defaults() {
		return {
			dayWidth: 10,
			taskHeight: 25,
			chartGridHeaderHeight: 40,
			openedTasks: ['t-1'],
			lastOpenedTask: null
		};
	}

	constructor(...args) {
		super(args);
		this._settings = R.clone(SettingsStoreClass.defaults);
	}

	get(settingName) {
		return this._settings[settingName] || null;
	}

	set(settingName, value) {
		this._settings[settingName] = value;
		this.emit(`${settingName}:change`);
	}

	addToCollection(settingName, element) {
		if (this._settings[settingName].indexOf(element) < 0 ) {
			this._settings[settingName].push(element);
			this.emit(`${settingName}:change`);
		}
	}

	removeFromCollection(settingName, element) {
		if (this._settings[settingName].indexOf(element) >= 0 ) {
			this._settings[settingName].splice(this._settings[settingName].indexOf(element), 1);
			this.emit(`${settingName}:change`);
		}
	}

	resetSetting(settingName) {
		this._settings[settingName] = R.clone(SettingsStoreClass.defaults[settingName]);
		this.emit(`${settingName}:change`);
	}
}

let SettingsStore = new SettingsStoreClass();

SettingsStore.dispatchToken = AppDispatcher.register((payload) => {
	if (payload.actionType === 'task:open') {
		SettingsStore.addToCollection('openedTasks', payload.taskId);
		SettingsStore.set('lastOpenedTask', payload.taskId);
	}

	if (payload.actionType === 'task:close') {
		SettingsStore.removeFromCollection('openedTasks', payload.taskId);
	}

	if (payload.actionType === 'setting:reset') {
		SettingsStore.resetSetting('openedTasks', payload.settingName);
	}
});

export default SettingsStore;