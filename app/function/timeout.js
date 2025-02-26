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

    const timeoutId = Number(timeoutDc);

    cache.set(`timeoutDc${ sender }`, timeoutId);

    return timeoutId;
}

async function stopTimeoutDc(sender) {
    const timeoutId = cache.get(`timeoutDc${ sender }`);
    cache.del(`timeoutDc${ sender }`);
    clearTimeout(timeoutId);
}

function startTimeoutChat(sender, config, chat, bot) {
    let timeout = config.timeoutChat * 1000 * 60;
    let timeoutChat =  setTimeout(() => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
        if(dataUser[0].chatPublic) {
            dataUser[0].chatPublic = false; 
            writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
            chat.sendMessage(`*Tidak terdapat pesan yang dikirim selama ${ config.timeoutChat } jam, mematikan chat untuk menghindari spam bot. Kirim _/chat on_ untuk menyalakan chat kembali...*\n\n_Note:_\n_pesan yang dikirim ke chat ini akan tetap dikirim ke game meskipun chat telah dimatikan_`)
            .then(() => {
                chat.sendMessage('*Anda dapat menggunakan fitur filter chat agar tetap dapat menerima pesan saat chat diatur ke of (_/tellme <pesan>_)*\n\nContoh:\n*_/tellme Obtained_*');
            });
        }
    }, timeout);

    const timeoutId = Number(timeoutChat);

    cache.set(`timeoutChat${ sender }`, timeoutId);

    return timeoutId;
}

async function stopTimeoutChat(sender) {
    const timeoutId = cache.get(`timeoutChat${ sender }`);
    cache.del(`timeoutChat${ sender }`);
    clearTimeout(timeoutId);
}

module.exports = {
    startTimeoutDc, stopTimeoutDc, startTimeoutChat, stopTimeoutChat
}