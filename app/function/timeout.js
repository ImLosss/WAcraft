require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');

async function startTimeoutDc(sender, config, chat, bot) {
    let TimeoutDisconnect = config.timeoutDc * 1000 * 60;
    let timeoutDc =  setTimeout(() => {
        chat.sendMessage(`*Tidak terdapat pesan selama ${ config.timeoutDc } menit. Disconnect dari server...*`);
        bot.quit();
    }, TimeoutDisconnect);

    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    const timeoutId = Number(timeoutDc);

    if(!dataUser[0].timeoutIds) dataUser[0].timeoutIds = {}

    dataUser[0].timeoutIds.timeoutDc = timeoutId;

    // Simpan ID interval ke file JSON
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

async function stopTimeoutDc(sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
    clearInterval(dataUser[0].intervalIds.broadcast);
    dataUser[0].intervalIds.broadcast = null;
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

module.exports = {
    startTimeoutDc, stopTimeoutDc
}