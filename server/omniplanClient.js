import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import request from 'request';
import mkpath from 'mkpath';
import ADMZip from 'adm-zip';
import R from 'ramda';
import restructureInitialData from './restructureInitialData';
import restructureChangelog from './restructureChangelog';
import mergeInitialDataAndChangelog from './mergeInitialDataAndChangelog';
import enrichProjectData from './enrichProjectData';
import config from '../config.json';

const ARCHIVE_URL  = `${config.storageUrl}/${config.projectId}.oplr/wrapper.zip`;
const AUTH_OPTIONS = { auth: {user: config.username, pass: config.password, sendImmediately: false} };

const PROJECT_FOLDER_PATH = path.join(__dirname, '..', `/tmp/${config.projectId}`);
const ARCHIVE_FILE_PATH = `${PROJECT_FOLDER_PATH}/wrapper.zip`;

// initial project
const RAW_INITIAL_DATA_XML_FILE_PATH = `${PROJECT_FOLDER_PATH}/Actual.xml`;
const RAW_INITIAL_DATA_JSON_FILE_PATH = `${PROJECT_FOLDER_PATH}/Actual.json`;
const RESTRUCTURED_INITIAL_DATA_JSON_FILE_PATH = `${PROJECT_FOLDER_PATH}/initialData.json`;

// changelog
const RAW_CHANGELOG_XML_FILE_PATH = `${PROJECT_FOLDER_PATH}/__changelog.xml`;
const RAW_CHANGELOG_JSON_FILE_PATH = `${PROJECT_FOLDER_PATH}/__changelog.json`;
const RESTRUCTURED_CHANGELOG_JSON_FILE_PATH = `${PROJECT_FOLDER_PATH}/changelog.json`;

// project (initial data with merged changelog)
const SHALLOW_PROJECT_DATA_JSON_FILE_PATH = `${PROJECT_FOLDER_PATH}/shallow-project.json`;
const PROJECT_DATA_JSON_FILE_PATH = `${PROJECT_FOLDER_PATH}/project.json`;

function prepareFileSystem() {
    return new Promise(function(resolve) {
        mkpath.sync(PROJECT_FOLDER_PATH);
        resolve();
    });
}

function loadProjectArchive() {
    return new Promise(function(resolve, reject) {
        request
            .get(ARCHIVE_URL, AUTH_OPTIONS)
            .on('response', res => resolve(res));
    });
}


function saveProjectArchive(response) {
    return new Promise(function(resolve, reject) {
        let saveStream = fs.createWriteStream(ARCHIVE_FILE_PATH);

        response.pipe(saveStream);

        saveStream.on('finish', () => resolve(ARCHIVE_FILE_PATH));
        saveStream.on('error', err => reject(err));
    });
}

function unzipData(archiveFilePath) {
    return new Promise(function(resolve, reject) {
        new ADMZip(archiveFilePath).extractAllTo(PROJECT_FOLDER_PATH, true);
        resolve(PROJECT_FOLDER_PATH);
    });
}

function generateProjectData() {
	let projectDataProcessing = new Promise((resolve, reject) => {
		readFile(RAW_INITIAL_DATA_XML_FILE_PATH)
			.then(convertXmlToJson)
			.then(saveFile(RAW_INITIAL_DATA_JSON_FILE_PATH))
			.then(restructureInitialData)
			.then(saveFile(RESTRUCTURED_INITIAL_DATA_JSON_FILE_PATH))
			.then(resolve)
			.catch((err) => console.log('Error in projectDataProcessing:', err.stack));
	});

	let changelogProcessing = new Promise((resolve, reject) => {
		readFile(RAW_CHANGELOG_XML_FILE_PATH)
			.then(convertXmlToJson)
			.then(saveFile(RAW_CHANGELOG_JSON_FILE_PATH))
			.then(restructureChangelog)
			.then(saveFile(RESTRUCTURED_CHANGELOG_JSON_FILE_PATH))
			.then(resolve)
			.catch((err) => console.log('Error in changelogProcessing:', err, err.stack));
	});

	return new Promise((resolve, reject) => {
		Promise
			.all([projectDataProcessing, changelogProcessing])
			.then(mergeInitialDataAndChangelog)
			.then(resolve)
			.catch((err) => console.log('Error in generateProjectData:', err, err.stack));
	});
}

function readFile(filePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) return reject(err);
            resolve(content);
        });
    });
}

function convertXmlToJson(xmlString) {
    return new Promise(function(resolve, reject) {
        xml2js.parseString(xmlString, function (err, data) {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

function saveFile(filePath) {
    return function(data) {
    	return new Promise(function(resolve, reject) {
    	    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
    	    resolve(data); // Is it ok, that our saveFile function returns data it has just saved?
    	});
    }
}


export function init() {
    return new Promise(function(resolve, reject) {
        prepareFileSystem()
            .then(loadProjectArchive)
            .then(saveProjectArchive)
            .then(unzipData)
            .then(generateProjectData)
            .then(saveFile(SHALLOW_PROJECT_DATA_JSON_FILE_PATH))
        	.then(enrichProjectData)
            .then(saveFile(PROJECT_DATA_JSON_FILE_PATH))
            .then(resolve)
            .catch((err) => console.log('Error in omniplanClient:', err, err.stack));
        // generateProjectData()
        // 	.then(saveFile(SHALLOW_PROJECT_DATA_JSON_FILE_PATH))
        // 	.then(enrichProjectData)
        //     .then(saveFile(PROJECT_DATA_JSON_FILE_PATH))
        //     .then(resolve)
        //     .catch((err) => console.log('Error in omniplanClient:', err.stack));
    });
}
