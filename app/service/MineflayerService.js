require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');

async function cekAlt(sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
    const user = dataUser[0].username;
    const ip = dataUser[0].ip;
    let listAlt = [];
    if(dataUser[1][ip].alt) listAlt = dataUser[1][ip].alt;

    const index = listAlt.indexOf(user);
    if (index !== -1) {
        // data ditemukan
    } else {
        if(user != dataUser[1][ip].realUser) { 
            listAlt.push(user);
            dataUser[1][ip].alt = listAlt;
            writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
        }
    }
}

function injectTitle (bot) {
    bot._client.on('title', (packet) => {
        if (packet.action === 0 || packet.action === 1) {
            bot.emit('title', packet.text)
        }
    })
  
    bot._client.on('set_title_text', (packet) => {
        bot.emit('title', packet.text)
    })
    bot._client.on('set_title_subtitle', (packet) => {
        setTimeout(() => {
            bot.emit('subtitle', packet.text)
        }, 100);
    })
}

async function startBroadcast(sender, config) {
    let repeatTimeoutBroadcast = config.broadcast.repeatInSec * 1000;
    let broadcastMessageArr = config.broadcast.message;
    let repeatIndex = 0
    const repeatIntervalBroadcast = setInterval(() => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
        if(dataUser[0].status == "online") {
            if(!dataUser[0].chatPublic) return;
            const message = broadcastMessageArr[repeatIndex];
            chat.sendMessage(`> ⓘ _${ message }_`);

            repeatIndex+=1;
            if (repeatIndex == broadcastMessageArr.length) repeatIndex = 0;
        } else {
            clearInterval(repeatInterval);
        }
    }, repeatTimeoutBroadcast);

    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    const intervalId = Number(repeatIntervalBroadcast);

    dataUser[0].intervalIds.broadcast = intervalId;

    // Simpan ID interval ke file JSON
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

async function stopBroadcast(sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
    clearInterval(dataUser[0].intervalIds.broadcast);
}

async function cekMember(client, sender) {
    const chat = await client.getChatById("120363355816098681@g.us");

    for (let participant of chat.participants) {
        const contact = participant.id._serialized;
        if(contact == sender) return true;
    }

    return false;
}

module.exports = {
    cekAlt, injectTitle, startBroadcast, stopBroadcast, cekMember
}