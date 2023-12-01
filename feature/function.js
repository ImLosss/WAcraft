const fs = require('fs');

async function chatPrivate(msg) {
    
}

async function chatPublic(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */chatPublic [on/off]*')
    if(pesan[1] == 'off' || pesan[1] == 'of') dataUser[0].chatPublic = false; 
    else if(pesan[1] == 'on') dataUser[0].chatPublic = true; 
    else return msg.reply('Format kamu salah, kirim kembali dengan format */chatPublic [on/off]*')

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply('Pengaturan berhasil diubah');
}

async function setIp(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setIp [ip]*')
    dataUser[0].ip = pesan[1]; 

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply(`IP berhasil diatur ke ${ pesan[1] }`);
}

async function setUser(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setUser [username]*')
    dataUser[0].username = pesan[1]; 

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply(`Username berhasil diatur ke ${ pesan[1] }`);
}

async function setAutoMsg(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 3) return msg.reply('Format kamu salah, kirim kembali dengan format */autmsg set [message]*')
    dataUser[0].automsg.message = pesan.slice(2, pesan.length);

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply(`Username berhasil diatur ke ${ pesan[1] }`);
}

async function disconnect(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].status = 'offline';

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply('Pengaturan berhasil diubah');
}

async function automsgof(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].automsg.status = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply('Pengaturan berhasil diubah');
}

module.exports = {
    chatPrivate, chatPublic, disconnect, setIp, setUser, setAutoMsg, automsgof
}