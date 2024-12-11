require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function')

async function setIp(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setIp <ip>*')
    dataUser[0].ip = pesan[1]; 

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`IP berhasil diatur ke ${ pesan[1] }`);
}

module.exports = {
    setIp
}