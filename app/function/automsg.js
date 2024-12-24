require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function')

async function automsg(bot, msg, arg, sender, chat) {
    if(arg == 'off' || arg == 'of') return automsgof(msg, sender);
    let time = arg;

    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    if(dataUser[0].automsg == undefined) return msg.reply('Atur pesan automsg anda terlebih dahulu dengan cara mengirim pesan dengan format */setautomsg <message>*');
    if(dataUser[0].automsg.status) return msg.reply('automsg masih aktif, kirim */automsg of* untuk menonaktifkannya');

    if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */automsg <time_in_min>*');
    let time2 = time * 60000 + 1000;
    dataUser[0].automsg.status = true;
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
    chat.sendMessage(`*Berhasil mengaktifkan automsg tiap ${ time } Menit*`);
    const intval = setInterval(() => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
        const auto = dataUser[0].automsg.message;
        if(dataUser[0].automsg.status) {
            bot.chat(auto);
            if(dataUser[0].chatPublic) chat.sendMessage('*Berhasil mengirimkan automsg*');
        } else clearInterval(intval);
    }, time2);
    let cekautomsg = setInterval(() => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
        if(!dataUser[0].automsg.status) { 
            clearInterval(cekautomsg);
            clearInterval(intval);
            msg.reply('*Berhasil menonaktifkan automsg*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan automsg*') });
        }
    }, 2000);
}

async function automsgof(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    dataUser[0].automsg.status = false;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

async function setAutoMsg(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');
    if(dataUser[0].automsg == undefined) dataUser[0].automsg = {};
    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setautomsg <message>*')
    let message = pesan.slice(1, pesan.length);
    message = message.join(" ");
    dataUser[0].automsg.message = message;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`automsg berhasil diatur ke *${ message }*`);
}

module.exports = {
    automsg, setAutoMsg
}