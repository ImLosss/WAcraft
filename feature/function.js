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

async function tellme(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let except = [];
    if(dataUser[0].except != undefined) except = dataUser[0].except;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */tellme [message]*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    except.push(pesan);

    dataUser[0].except = except;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply(`Pesan ${ pesan } berhasil ditambahkan pada whitelist msg`);
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
    if(dataUser[0].automsg == undefined) dataUser[0].automsg = {};
    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setautomsg [message]*')
    let message = pesan.slice(1, pesan.length);
    message = message.join(" ");
    dataUser[0].automsg.message = message;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply(`automsg berhasil ditur ke ${ message }`);
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
    chatPrivate, chatPublic, disconnect, setIp, setUser, setAutoMsg, automsgof, tellme
}