require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function');
const { withErrorHandling, cutVal, checkCommandStatus } = require('function/function');
const cmd = require('import/AutoCmdImport');

const prefixFunctions = {
    'afkfish': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => cmd.fishing(bot, msg, sender, value)),
    'autorightclick': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => cmd.autoRightClick(bot, msg, value, sender)),
    'autoleftclick': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => cmd.autoLeftClick(bot, msg, value, sender)),
    'automsg': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => cmd.automsg(bot, msg, value, sender, chat)),
    'inventory': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => { chat.sendMessage(cmd.getInventory(bot)); }),
    'throw': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => { chat.sendMessage(cmd.throwItem(bot, msg, value)) }),
    'equip': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => { chat.sendMessage(cmd.equipItem(bot, msg, value)) }),
    'health': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => { chat.sendMessage(`Health: ${ Math.round(bot.health) }`); }),
    'exp': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => { chat.sendMessage(`Exp: ${ bot.experience.points }`); }),
    'chat': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => cmd.chatPublic(msg, sender, value)),
    'autoreconnect': withErrorHandling((bot, sender, dirUser, chat, msg, value, client) => cmd.setAutoReconnect(msg, sender, value)),
};  

async function cekautocmd(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;
    autocmd = autocmd.join(', ');

    if(autocmd.length < 1) return  msg.reply('data kosong');
    else return msg.reply(`autocmd: *${ autocmd }*`);
}

async function autocmd(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */autocmd <message>*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    let duplicate = false;
    autocmd.forEach(item => {
        if (item == pesan) { 
            duplicate = true;
            return;
        }
    });
    if (duplicate) return msg.reply(`cmd *${ pesan }* telah ada dalam list cmd`);
    autocmd.push(pesan);

    dataUser[0].autocmd = autocmd;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`Pesan *${ pesan }* berhasil ditambahkan pada autocmd`);
}

function startAutoCmd(bot, dataUser, dirUser, sender, msg, chat, client) {
    let array = dataUser[0].autocmd;
    let repeatCmd = 0;

    const repeatInterval = setInterval(() => {
        try {
            const pesan = array[repeatCmd];
            const command = pesan.toLowerCase();
            const text = command.toLowerCase() || '';
            
            const funcName = text.replace('/', '').trim().split(' ');

            const value = cutVal(command, 1);

            if (prefixFunctions[funcName[0]]) {
                console.game(value, `cmd:${ funcName[0] }`, sender, 'cmd');
                
                if(!checkCommandStatus(funcName[0])) chat.sendMessage(`Command */${ funcName[0] }* dinonaktifkan`);
                else {
                    prefixFunctions[funcName[0]](bot, sender, dirUser, chat, msg, value, client);
                    chat.sendMessage(`*mengirim pesan ${ pesan }*`);
                }
            } else {
                try {
                    bot.chat(pesan);
                    chat.sendMessage(`*mengirim pesan ${ pesan }*`);
                } catch (err) {
                    console.gameError(err, sender);
                    chat.sendMessage('Terjadi kesalahan saat mengirim autocmd...');
                }
            }
            repeatCmd +=1;
            if (repeatCmd == array.length) clearInterval(repeatInterval);
        } catch (err) { 
            chat.sendMessage(`Terjadi kesalahan: ${ err.message }`)
            console.error(err);
            repeatCmd +=1;
            if (repeatCmd == array.length) clearInterval(repeatInterval);
        }
    }, 5000);

}

async function delautocmd(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */delautocmd <message>*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    msg.reply(removeFromArray(autocmd, pesan));

    dataUser[0].autocmd = autocmd;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

module.exports = {
    cekautocmd, autocmd, delautocmd, startAutoCmd
}