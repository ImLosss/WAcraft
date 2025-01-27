require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const fs = require('fs');
const cache = require('cache');

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

    const timeoutId = Number(timeoutDc);

    cache.set(`timeoutDc${ sender }`, timeoutId);

    return timeoutId;
}

async function stopTimeoutDc(sender) {
    const timeoutId = cache.get(`timeoutDc${ sender }`);
    cache.del(`timeoutDc${ sender }`);
    clearTimeout(timeoutId);
}

module.exports = {
    startTimeoutDc, stopTimeoutDc
}