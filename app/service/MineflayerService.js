require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function');
const { cutVal, withErrorHandling } = require("function/function");
const fs = require('fs');
const path = require('path');
const cache = require('cache');

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

async function chatPublic(msg, sender, arg) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    const chat = await msg.getChat();

    if(arg == 'off' || arg == 'of') dataUser[0].chatPublic = false; 
    else if(arg == 'on') dataUser[0].chatPublic = true; 
    else return msg.reply('Format kamu salah, kirim kembali dengan format */chat <on/of>*')

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return chat.sendMessage('Pengaturan berhasil diubah');
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

    const intervalId = Number(repeatIntervalBroadcast);

    cache.set(`broadcast${ sender }`, intervalId);
}

async function stopBroadcast(sender) {
    let intervalId = cache.get(`broadcast${ sender }`);
    clearInterval(intervalId);
    cache.del(`broadcast${ sender }`)
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

async function cekInfo(msg, sender) {
    const chat = await msg.getChat();
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    jsonData = dataUser[1];

    if (jsonData == undefined) return msg.reply('Data kosong');
    if (Object.keys(jsonData).length === 0) return msg.reply('Data kosong');

    const dataArray = Object.entries(jsonData).map(([key, value]) => ({
        ip: key,
        version: value.version ? value.version : 'None',
        realUser: value.realUser,
        alt: value.alt
    }));

    let send = "*Info Akun & List Alt*\n\n"
    let no = 1;
    dataArray.map(item => {
        let listAlt = item.alt;
        if(listAlt.length > 0) listAlt = listAlt.join(', ');
        else listAlt = "None";

        send+=`ip: ${ item.ip }\nversion: ${ item.version }\nrealUser: ${ item.realUser }\nalt: ${ listAlt }\n`;
        if(dataArray.length != no) {
        send+='-----------------------------------------\n'
        no+=1;
        }
    })

    return chat.sendMessage(send, { linkPreview: false });
}

async function getInfoUser(msg, client, arg) {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda
    
    let username = arg;

    if(!username) return msg.reply('Command kamu salah, kirim kembali dengan format /getinfouser <username>');

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        files.forEach(async (user) => {
            const filePath = path.join(folderPath, user);
            const formattedNumber = await client.getFormattedNumber(user);
        
            // Baca file JSON
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${user}:`, err);
                    return;
                }

                // Ubah data dalam file JSON
                try {
                    const jsonData = JSON.parse(data);

                    if(!jsonData[1]) return
                    if (Object.keys(jsonData).length === 0) return console.log('data Kosong');

                    dataUser = jsonData[1];

                    const dataArray = Object.entries(dataUser).map(([key, value]) => ({
                        ip: key,
                        realUser: value.realUser,
                        alt: value.alt
                    }));
                    
                    let output = dataArray.filter((item) => {
                        const foundAlt = item.alt.find((listAlt) => listAlt == username);
                        return foundAlt;
                    })

                    let send = `WA: ${ formattedNumber }\n`;
                    output.map((item) => {
                        altStr = item.alt.join(', ');
                        send+=`ip: ${ item.ip }\nrealUser: ${ item.realUser }\nalt: ${ altStr }\n`;
                    })
                    if (send != `WA: ${ formattedNumber }\n`) return msg.reply(send);
                } catch (parseErr) {
                    console.error(parseErr);
                }
            });
        });
    });
}

async function donate(msg, config, sender) {
    try {
        const chat = await msg.getChat();

        const name = chat.lastMessage._data.notifyName || 'User';
        const message = `Hai ${ name }! 👋

    Terima kasih telah menggunakan MinecraftBot! 🎮

    Jika kamu merasa terbantu dengan adanya Bot ini, support dengan cara share/donate. Dukunganmu akan sangat berarti untuk menjaga Bot ini tetap berjalan dan berkembang.
        
    https://sociabuzz.com/losss/tribe

Terima kasih atas perhatian dan dukunganmu! 💖`;

        chat.sendMessage(message, { linkPreview: true });
    } catch (err) {
        console.log(`Terjadi kesalahan saat mengirim pesan donasi :\n${ err }`);
    }
    
}

module.exports = {
    cekAlt, injectTitle, startBroadcast, stopBroadcast, cekMember, disconnect, chatPublic, setVer, setUser, setRealUser, playerOnline, findItemById, cekInfo, getInfoUser, donate
}