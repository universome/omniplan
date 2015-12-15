import express from 'express';
import * as omniplanClient from './omniplanClient';
import Root from '../app/components/Root';
import React from 'react';
import path from 'path';

const PORT = process.env.PORT || 3000;
const PROD = process.env.PROD || false;
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 10 * 60 * 1000; /* Update data every 10 minutes */

var app = express();
var responseData = null;

updateResponseData()
	.then(startServer)
	.then(startUpdatingData)
	.catch(err => console.log('Error in server:', err, err.stack));

function startServer(port) {
	app.all('*', (req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Access-Control-Allow-Credentials', true);
		next();
	});

	app.use('/', express.static( path.resolve(__dirname, '..', 'bin') ));
	app.get('/', (req, res) => res.send('<!DOCTYPE html>' + React.renderToString(<Root PROD={PROD}/>)));
	app.get('/getPlan', (req, res) => res.send(responseData));
	app.listen(PORT, console.log.bind(console, `Server has started on port: ${PORT}`));
}

function updateResponseData() {
	return new Promise((resolve, reject) => {
		omniplanClient.init().then(data => {
			responseData = data;
			responseData.updateTime = Date.now();
			console.info('Response data updated', responseData.updateTime);
			resolve();
		}).catch((err) => console.log('Error in updateResponseData:', err.stack));
	});
}

function startUpdatingData() {
	return new Promise((resolve) => {
		setInterval(updateResponseData, UPDATE_INTERVAL);
		resolve();
	});
}
