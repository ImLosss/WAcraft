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

async function listener(bot, msg) {
    const chat = await msg.getChat();
    bot.on('health', () => {
        let health = bot.health;
        health = Math.round(health);

        if(health <= 5) chat.sendMessage(`> ⚠️ _Darah kamu sisa ${ health }_`);
    })

    bot.on('death', () => {
        chat.sendMessage('> ⚠️ _You Die_');
    })
}

module.exports = {
    cekAlt, injectTitle, listener
}