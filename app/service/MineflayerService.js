require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function');
const { cutVal } = require("function/function");

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

async function chatPublic(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */chat <on/of>*')
    if(pesan[1] == 'off' || pesan[1] == 'of') dataUser[0].chatPublic = false; 
    else if(pesan[1] == 'on') dataUser[0].chatPublic = true; 
    else return msg.reply('Format kamu salah, kirim kembali dengan format */chat <on/of>*')

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply('Pengaturan berhasil diubah');
}

async function setUser(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setUser <username>*')
    const username = cutVal(msg.body, 1);
    dataUser[0].username = username; 

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`Username berhasil diatur ke ${ pesan[1] }`);
}

async function setVer(msg, sender) {
    let config = readJSONFileSync(`./config.json`);
    let versions = config.versions;
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    if(!dataUser[0].ip) return msg.reply('Atur ip kamu terlebih dahulu');

    let ip = dataUser[0].ip;

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let version = pesan[1];

    if(!versions.includes(version)) return msg.reply(`Versi minecraft yang kamu pilih salah. Kirim */setver <version>* untuk mengatur versi.\n*Contoh: /setver 1.20*\n\nList Version:\n${ versions.join(', ') }`)

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setVer <version>*')
    if(!dataUser[1][ip]) dataUser[1][ip] = {};
    dataUser[1][ip].version = version; 

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`Versi minecraft berhasil diatur ke ${ version }`);
}

async function setRealUser(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    if(!dataUser[0].ip) return msg.reply('Atur ip kamu terlebih dahulu');

    const ip = dataUser[0].ip;

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setRealUser <username>*')
    const username = cutVal(msg.body, 1);

    if (dataUser[1] == undefined) dataUser[1] = {};
    if(!dataUser[1][ip]) dataUser[1][ip] = {};
    dataUser[1][ip].realUser = username;

    let listAlt = [];
    if(dataUser[1][ip].alt) listAlt = dataUser[1][ip].alt;
    removeFromArray(listAlt, pesan);
    dataUser[1][ip].alt = listAlt;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`Real username berhasil diatur ke *${ username }*`);
}

async function disconnect(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`, 'utf-8');

    dataUser[0].status = 'offline';

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply('Pengaturan berhasil diubah');
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

async function startBroadcast(sender, config, chat) {
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
            stopBroadcast(sender);
        }
    }, repeatTimeoutBroadcast);

    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    const intervalId = Number(repeatIntervalBroadcast);

    if(!dataUser[0].intervalIds) dataUser[0].intervalIds = {}

    dataUser[0].intervalIds.broadcast = intervalId;

    // Simpan ID interval ke file JSON
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

async function stopBroadcast(sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
    clearInterval(dataUser[0].intervalIds.broadcast);
    dataUser[0].intervalIds.broadcast = null;
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

async function cekMember(client, sender) {
    const chat = await client.getChatById("120363355816098681@g.us");

    for (let participant of chat.participants) {
        const contact = participant.id._serialized;
        if(contact == sender) return true;
    }

    return false;
}

async function playerOnline(bot, msg) {
    const chat = await msg.getChat();
    let player = [];
    for (const playerName in bot.players) {
        player.push(playerName);
    }
    let jml = player.length;
    player = player.join(', ');

    return msg.reply(`*Players Online(${ jml }):*\n\n${ player }`).catch(() => { chat.sendMessage(`*Players Online:*\n\n${ player }`) });
}

function findItemById(id, bot) {
    const data = bot.registry.itemsByName;
    return Object.values(data).find(item => item.id === id) || null;
}

module.exports = {
    cekAlt, injectTitle, startBroadcast, stopBroadcast, cekMember, disconnect, chatPublic, setVer, setUser, setRealUser, playerOnline, findItemById
}