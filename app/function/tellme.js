require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function')

async function cektellme(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let except = [];
    if(dataUser[0].except != undefined) except = dataUser[0].except;
    except = except.join(', ');

    if(except.length < 1) return  msg.reply('data kosong');
    else return msg.reply(`tellme: *${ except }*`);
}

async function deltellme(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let except = [];
    if(dataUser[0].except != undefined) except = dataUser[0].except;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */deltellme <message>*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    msg.reply(removeFromArray(except, pesan));

    dataUser[0].except = except;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

async function tellme(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let except = [];
    if(dataUser[0].except != undefined) except = dataUser[0].except;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */tellme <message>*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    let duplicate = false;
    except.forEach(item => {
        if (item == pesan) { 
            duplicate = true;
            return
        }
    });
    if(duplicate) return msg.reply(`chat *${ pesan }* telah ada dalam whitelist msg`);
    except.push(pesan);

    dataUser[0].except = except;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`Pesan *${ pesan }* berhasil ditambahkan pada whitelist msg`);
}

module.exports = {
    tellme, cektellme, deltellme
}