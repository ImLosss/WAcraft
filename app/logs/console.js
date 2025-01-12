const fs = require('fs');
const moment = require('moment-timezone');
const lockfile = require('proper-lockfile');
const { getLocation, getLocationError, writeJSONFileSync, readJSONFileSync } = require('../function/utils');
const CircularJSON = require('circular-json');

async function error(errorMsg) {
    try {
        // Tentukan zona waktu Makassar
        const time = getTime();
        const file = getLocationError();

        console.log(`[${ time } / error] ${ errorMsg.message? errorMsg.message : errorMsg }`);

        let errorData = readJSONFileSync('app/logs/error.json')

        const stackLines = errorMsg.stack.split('\n');

        const data = {
            type: 'Error',
            date: time,
            errorLocation: file,
            errorMessage: errorMsg.message? errorMsg.message : errorMsg,
            error: errorMsg instanceof Error ? `${errorMsg.message}\n${errorMsg.stack}` : errorMsg
        }

        errorData.push(data);

        if(errorData.length > 50) errorData.splice(0, 1);

        writeJSONFileSync('app/logs/error.json', errorData);
    } catch (error) {
        console.log('error saat menulis log: ', error.message);
    }
}

async function log(log, type = 'info') {
    try {
        // Tentukan zona waktu Makassar
        const file = getLocation();

        const time = getTime();
        if(typeof(log) == 'object') {
            log = CircularJSON.stringify(log);
            type = "object"
        }
        console.log(`[${ time } / ${ type }] ${ log }`);

        let logData = readJSONFileSync(`app/logs/log.json`);
         
        const data = {
            type: type,
            date: time,
            location: file,
            message: log
        }

        logData.push(data);

        if(logData.length > 500) logData.splice(0, 1);

        writeJSONFileSync('app/logs/log.json', logData);
    } catch (error) {
        console.log('error saat menulis log: ', error.message);
    }
}

async function game(log, id, type = 'ingame') {
    try {
        const dir = `database/chat_game/log_${ id }.json`;
        // Tentukan zona waktu Makassar
        const file = getLocation();

        const time = getTime();
        if(typeof(log) == 'object') log = CircularJSON.stringify(log);
        console.log(`[${ time } / ${ type }_${ id }] ${ log }`);

        let logData = readJSONFileSync(dir);
         
        const data = {
            type: type,
            date: time,
            location: file,
            message: log
        }

        logData.push(data);

        if(logData.length > 500) logData.splice(0, 1);

        writeJSONFileSync(dir, logData);
    } catch (error) {
        console.log('error saat menulis log: ', error.message);
    }
}

async function gameError(errorMsg, id) {
    try {
        const dir = `database/chat_game/error_${ id }.json`;

        // Tentukan zona waktu Makassar
        const time = getTime();

        console.log(`[${ time } / error_${ id }] ${ errorMsg instanceof Error ? errorMsg.message : errorMsg }`);

        let errorData = readJSONFileSync(dir)

        const stackLines = errorMsg.stack.split('\n');

        const data = {
            type: 'Error',
            date: time,
            errorLocation: stackLines[1] ? stackLines[1] : null,
            errorMessage: errorMsg instanceof Error ? errorMsg.message : errorMsg,
            error: errorMsg instanceof Error ? `${errorMsg.message}\n${errorMsg.stack}` : errorMsg
        }

        errorData.push(data);

        if(errorData.length > 50) errorData.splice(0, 1);

        writeJSONFileSync(dir, errorData);
    } catch (error) {
        console.log('error saat menulis log: ', error.message);
    }
}

function getTime() {
    // Tentukan zona waktu Makassar
    const time = moment().tz('Asia/Makassar');

    // Ambil tanggal, jam, dan menit
    const tanggal = time.format('YYYY-MM-DD');
    const jam = time.format('HH');
    const menit = time.format('mm');

    return `${ tanggal } / ${ jam }:${ menit }`;
}

module.exports = {
    log, error, game, gameError
}