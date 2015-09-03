import express from 'express';
import * as omniplanClient from './omniplanClient';

const PORT = 3001;

var server = express();
var responseData = null;

export function start(port) {
	var port = port || PORT;
	server.get('/getData', (req, res) => res.send(responseData));
	server.listen(port, console.log.bind(console, `Server has started on port: ${port}`));
}

export function prepareData() {
	return new Promise((resolve, reject) => {
		omniplanClient.init()
			.then(data => {
				responseData = data;
				resolve();
			});
	});
}

prepareData()
	.then(start)
	.catch(console.log.bind(console));
