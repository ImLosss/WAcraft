const fs = require('fs');

exports.setAutoReconnect = async function (msg, sender) { 
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2 || (pesan[1] != 'of' && pesan[1] != 'on')) return msg.reply('Format kamu salah, kirim kembali dengan format */autoReconnect [on/off]*')
    if(pesan[1] == 'on') dataUser[0].autoReconnect = true; 
    if(pesan[1] == 'of') dataUser[0].autoReconnect = false; 

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`Username berhasil diatur ke ${ pesan[1] }`);
}

exports.autocmd = async function autocmd(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */autocmd [message]*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    autocmd.push(pesan);

    dataUser[0].autocmd = autocmd;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`Pesan ${ pesan } berhasil ditambahkan pada autocmd`);
}

exports.cekautocmd = async function cekautocmd(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;
    autocmd = autocmd.join(', ');

    if(autocmd.length < 1) return  msg.reply('data kosong');
    else return msg.reply(`autocmd: *${ autocmd }*`);
}

exports.delautocmd = async function delautocmd(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) except = dataUser[0].autocmd;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */delautocmd [message]*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    msg.reply(removeFromArray(autocmd, pesan));

    dataUser[0].autocmd = autocmd;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
}