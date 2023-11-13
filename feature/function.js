const fs = require('fs');

async function chatPrivate(msg) {
    
}

async function chatPublic(msg, sender) {
    console.log('tess');
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

async function disconnect(msg, sender) {
    console.log('tess');
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].status = 'offline';

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

    return msg.reply('Pengaturan berhasil diubah');
}

module.exports = {
    chatPrivate, chatPublic, disconnect
}