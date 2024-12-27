require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function');
const { cutVal, withErrorHandling } = require("function/function");

async function setAutoReconnect(msg, sender, arg) { 
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    console.log(arg);

    if(arg != 'off' && arg != 'of' && arg != 'on') return msg.reply('Format kamu salah, kirim kembali dengan format */autoReconnect <on/off>*')
    if(arg == 'on') dataUser[0].autoReconnect = true; 
    else if(arg == 'of' || arg == 'off') dataUser[0].autoReconnect = false; 

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    return msg.reply(`autoreconnect diatur ke *${ arg }*`);
}

module.exports = {
    setAutoReconnect
}