import fs from 'fs';
import path from 'path';
// import R from 'ramda';
import unzip from 'unzip';
import {parseString} from 'xml2js';
import request from 'request';
import processData from './processData';

const USERNAME    = '***REMOVED***';
const PASSWORD    = '***REMOVED***';
const ARCHIVE_URL = 'https://sync6.omnigroup.com/***REMOVED***/bLoHHW4hnhn.oplr/wrapper.zip';
const AUTH_DATA = { auth: {user: USERNAME, pass: PASSWORD, sendImmediately: false} };

const RAW_DATA_FOLDER_PATH = path.join(__dirname, '..', '/tmp/downloads/wrapper');
const RAW_DATA_XML_FILE_NAME = 'Actual.xml';
const RAW_DATA_JSON_FILE_NAME = 'Actual.json';

const NORMAL_DATA_FOLDER_PATH = path.join(__dirname, '..', '/tmp');
const NORMAL_DATA_JSON_FILE_NAME = 'data.json';


function loadFile(file_url, options) {
    return new Promise(function(resolve, reject) {
        request
            .get(file_url, options)
            .on('response', res => resolve(res));
    });
}

function unzipAndSaveResponse(response) {
    return new Promise(function(resolve, reject) {

        var folderPath = RAW_DATA_FOLDER_PATH;// + '-' + Date.now();
        var unzipStream = unzip.Extract({ path: folderPath });

        // Let's save our files unzipped?
        response.pipe(unzipStream);

        // We set timeout, because we should wait,
        // while file system will recognize our created folder
        // or file descriptor is closed or smth
        // unzipStream.on('finish', setTimeout.bind(null, resolve.bind(this, folderPath), 100));
        unzipStream.on('finish', function() {
            // unzipStream.end();
            // console.log(fs.existsSync(folderPath), folderPath + '/' + RAW_DATA_XML_FILE_NAME);
            resolve(folderPath);
        });
        unzipStream.on('error', err => reject(err));
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
        fs.writeFile(NORMAL_DATA_FOLDER_PATH + '/' + NORMAL_DATA_JSON_FILE_NAME, JSON.stringify(data), (err) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}


export function init() {
    return new Promise(function(resolve, reject) {
        loadFile(ARCHIVE_URL, AUTH_DATA)
            .then(unzipAndSaveResponse)
            .then(getFile)
            .then(convertXmlToJson)
            .then(processData)
            .then(saveJSON)
            .then(resolve);
    });
}
