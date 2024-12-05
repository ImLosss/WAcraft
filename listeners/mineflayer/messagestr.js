require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');

module.exports = (function() {
    return function(bot, dirUser, msg, chat, sender) {
        let message, timeoutDc;
        bot.on('messagestr', withErrorHandling(async (msgstr) => {
            if(msgstr.trim().length == 0 || message == msgstr) return;
    
            msgstr = msgstr.trim();
    
            // menambah timeout untuk disconnect jika tidak terdapat aktivitas
            clearTimeout(timeoutDc);
            timeoutDc =  setTimeout(() => {
                chat.sendMessage('*Tidak terdapat pesan selama 15 menit. Disconnect dari server...*');
                bot.quit();
            }, 1000*60*15);
    
            message = msgstr;
            let except = [];
            let dataUser = readJSONFileSync(dirUser);
            if (msgstr.includes(`who ${ dataUser[0].username }`)) bot.chat(`Im ${ dataUser[1][ip].realUser }`);
            if(dataUser[0].except != undefined) except = dataUser[0].except;
            if(except.some(pre => msgstr.includes(pre))) return chat.sendMessage(msgstr);
            if(!dataUser[0].chatPublic) return;
            console.game(msgstr, sender);
            chat.sendMessage(msgstr).catch((err) => { console.gameError('error saat mengirim pesan') });
        }, msg))
    };
})();