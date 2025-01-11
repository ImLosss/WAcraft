require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { startTimeoutDc, stopTimeoutDc } = require('function/timeout');

module.exports = (function() {
    return function(bot, dirUser, msg, chat, sender, config) {
        let message;
        startTimeoutDc(sender, config, chat, bot);
        bot.on('messagestr', withErrorHandling(async (msgstr) => {
            if(msgstr.trim().length == 0 || message == msgstr) return;
    
            msgstr = msgstr.trim();
            
            stopTimeoutDc(sender);
            startTimeoutDc(sender, config, chat, bot);
    
            message = msgstr;
            let except = [];
            let dataUser = readJSONFileSync(dirUser);
            let ip = dataUser[0].ip;
            if (msgstr.includes(`who ${ dataUser[0].username }`)) bot.chat(`Im ${ dataUser[1][ip].realUser }`);
            if(dataUser[0].except != undefined) except = dataUser[0].except;
            if(except.some(pre => msgstr.includes(pre))) return chat.sendMessage(msgstr);
            if(!dataUser[0].chatPublic) return;
            console.game(msgstr, sender);
            chat.sendMessage(msgstr, { linkPreview: false }).catch((err) => { console.gameError('error saat mengirim pesan') });
        }, msg))
    };
})();