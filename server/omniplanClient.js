import fs from 'fs';
import path from 'path';
import {parseString} from 'xml2js';
import request from 'request';
import mkpath from 'mkpath';
import ADMZip from 'adm-zip';
import R from 'ramda';
import processData from './processData';

const USERNAME    = '***REMOVED***';
const PASSWORD    = '***REMOVED***';
const ARCHIVE_URL = 'https://sync6.omnigroup.com/***REMOVED***/aqCSESNf5vT.oplr/wrapper.zip';
const AUTH_OPTIONS = { auth: {user: USERNAME, pass: PASSWORD, sendImmediately: false} };

const RAW_DATA_FOLDER_PATH = path.join(__dirname, '..', '/tmp/downloads/wrapper');
const ARCHIVE_FILE_NAME = 'wrapper.zip';
const RAW_DATA_XML_FILE_NAME = 'Actual.xml';
const RAW_DATA_JSON_FILE_NAME = 'Actual.json';

const NORMAL_DATA_FOLDER_PATH = path.join(__dirname, '..', '/tmp');
const NORMAL_DATA_JSON_FILE_NAME = 'data.json';

function prepareFileSystem() {
    return new Promise(function(resolve) {
        mkpath.sync(NORMAL_DATA_FOLDER_PATH);
        mkpath.sync(RAW_DATA_FOLDER_PATH);
        resolve();
    });
}

function loadFile(file_url, options) {
    return new Promise(function(resolve, reject) {
        request
            .get(ARCHIVE_URL, AUTH_OPTIONS)
            .on('response', res => resolve(res));
    });
}


function saveResponse(response) {
    return new Promise(function(resolve, reject) {
        let filePath   = `${RAW_DATA_FOLDER_PATH}/${ARCHIVE_FILE_NAME}`;
        let saveStream = fs.createWriteStream(filePath);

        response.pipe(saveStream);

        saveStream.on('finish', () => resolve(filePath));
        saveStream.on('error', err => reject(err));
    });
}

function unzipData(archiveFilePath) {
    return new Promise(function(resolve, reject) {
        let folderPath = RAW_DATA_FOLDER_PATH;
        let zip = new ADMZip(archiveFilePath);

        zip.extractAllTo(folderPath, true);
        resolve(folderPath);
    });
}


function getFile(folderPath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(path.join(folderPath, '/', RAW_DATA_XML_FILE_NAME), 'utf8', (err, xmlString) => {
            if (err) return reject(err);
            resolve(xmlString);
        });
    });
}

function convertXmlToJson(xmlString) {
    return new Promise(function(resolve, reject) {
        parseString(xmlString, function (err, data) {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

function saveJSON(data) {
    return new Promise(function(resolve, reject) {
        // fs.writeFile(`${NORMAL_DATA_FOLDER_PATH}/${NORMAL_DATA_JSON_FILE_NAME}`, JSON.stringify(data), (err) => {
        //     if (err) return reject(err);
        //     resolve(data);
        // });
        fs.writeFileSync(`${NORMAL_DATA_FOLDER_PATH}/${NORMAL_DATA_JSON_FILE_NAME}`, JSON.stringify(data), 'utf-8');
        resolve(data);
    });
}


export function init() {
    return new Promise(function(resolve, reject) {
        prepareFileSystem()
            .then(loadFile)
            .then(saveResponse)
            .then(unzipData)
            .then(getFile)
            .then(convertXmlToJson)
            .then(processData)
            .then(saveJSON)
            .then(resolve)
            .catch((err) => console.log('Error in omniplanClient:', err));
        // getFile(RAW_DATA_FOLDER_PATH)
        //     .then(convertXmlToJson)
        //     .then(processData)
        //     .then(saveJSON)
        //     .then(resolve)
        //     .catch((err) => console.log('Error in omniplanClient:', err.stack));
    });
}
