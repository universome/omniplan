import R from 'ramda'

export default function mergeInitialDataAndChangelog([initialData, changelog]) {
	return new Promise((resolve, reject) => {
		changelog.taskChanges.forEach(taskChange => {
			let task = R.find(R.propEq('id', taskChange.taskId), initialData.tasks);
			if (!task) {
				console.log(taskChange.taskId, taskChange.to, taskChange.from)
			}
		});

		resolve(initialData)
	});
}