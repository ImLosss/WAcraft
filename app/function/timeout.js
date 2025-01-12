require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const fs = require('fs');

function startTimeoutDc(sender, config, chat, bot) {
    let TimeoutDisconnect = config.timeoutDc * 1000 * 60;
    let timeoutDc =  setTimeout(() => {
        chat.sendMessage(`*Tidak terdapat pesan selama ${ config.timeoutDc } menit. Disconnect dari server...*`);
        bot.quit();
    }, TimeoutDisconnect);

    if(!fs.existsSync(`./database/timeout/${ sender }`)) {
        let dataTimeout = {};
        writeJSONFileSync(`./database/timeout/${ sender }`, dataTimeout)
    }

    let dataTimeout = readJSONFileSync(`./database/timeout/${ sender }`);

    const timeoutId = Number(timeoutDc);

    dataTimeout.timeoutId = timeoutId;

    // Simpan ID interval ke file JSON
    writeJSONFileSync(`./database/timeout/${ sender }`, dataTimeout);

    return timeoutId;
}

async function stopTimeoutDc(sender, timeoutId) {
    let dataTimeout = readJSONFileSync(`./database/timeout/${ sender }`);
    if(!timeoutId) timeoutId = dataTimeout.timeoutId;
    clearTimeout(timeoutId);
    dataTimeout.timeoutId = null;
    writeJSONFileSync(`./database/timeout/${ sender }`, dataTimeout);
}

module.exports = {
    startTimeoutDc, stopTimeoutDc
}