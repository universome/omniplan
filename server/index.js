import express from 'express';
import * as omniplanClient from './omniplanClient';
import Root from '../app/components/Root';
import React from 'react';

const PORT = 3001;

var server = express();
var responseData = null;

export function start(port) {
	var port = port || PORT;

	server.all('*', (req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Access-Control-Allow-Credentials', true);
		next();
	});

	server.get('/', (req, res) => {
		res.send('<!DOCTYPE html>' + React.renderToString(
			<Root>
			</Root>
		));
	});

	server.get('/getPlan', (req, res) => {
		console.log('getPlan request');
		res.send(responseData);
	});
	server.listen(port, console.log.bind(console, `Server has started on port: ${port}`));
}

export function prepareData() {
	return new Promise((resolve, reject) => {
		omniplanClient
			.init()
			.then(data => {
				// console.log('Response tasks:', data.tasks);
				responseData = data;
				resolve();
			});
	});
}

prepareData()
	.then(start)
	.catch(console.log.bind(console));
