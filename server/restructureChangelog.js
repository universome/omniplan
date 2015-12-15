import _ from 'lodash'
import R from 'ramda'

export default function restructureChangelog(rawChangelog) {
	return new Promise((resolve, reject) => {
		let changelog = {}
		let taskChanges = rawChangelog.changelog['task-change-set'].map(set => set.change.map(restructureTaskChange));

		changelog.taskChanges = R.flatten(taskChanges);

		resolve(changelog)
	});
}

function restructureTaskChange(rawTaskChange) {
	// Rename some fields (camelCase and stuff) first
	let change = extractDataFromTaskChange(rawTaskChange);

	// Some changes contain subchanges (when we were making bulk attribute changes, I suppose)
	// That's why we have to return array of changes (because we flat them all)
	return rawTaskChange.change ? rawTaskChange.change.map(subChange => R.merge(extractDataFromTaskChange(subChange), change)) : change;	
}

function extractDataFromTaskChange(rawTaskChange) {
	let change = {};

	if (rawTaskChange.$.idref) change.taskId = rawTaskChange.$.idref;
	if (rawTaskChange.$.attribute) change.attribute = rawTaskChange.$.attribute;
	if (rawTaskChange.$.type) change.type = rawTaskChange.$.type;
	if (rawTaskChange.$.from) change.from = rawTaskChange.$.from;
	if (rawTaskChange.$.to) change.to = rawTaskChange.$.to;
	if (rawTaskChange.$['to-position']) change.toPosition = rawTaskChange.$['to-position'];
	if (rawTaskChange.$['from-position']) change.fromPosition = rawTaskChange.$['from-position'];
	if (rawTaskChange.$.resurrection) change.resurrection = rawTaskChange.$.resurrection;
	if (rawTaskChange.$.resolve) change.resolve = rawTaskChange.$.resolve;
	if (rawTaskChange.$.user) change.user = rawTaskChange.$.user;
	if (rawTaskChange.$.date) change.date = rawTaskChange.$.date;
	if (rawTaskChange.$.timestamp) change.timestamp = rawTaskChange.$.timestamp;

	return change;
}