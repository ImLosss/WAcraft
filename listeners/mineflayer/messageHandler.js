require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { cutVal } = require("function/function");
const cmd = require('import/CommandImportMineflayer');

const prefixFunctions = {
    'dc': withErrorHandling((bot, sender, dirUser, chat, msg) => { bot.quit() }),
    'playerlist': withErrorHandling((bot, sender, dirUser, chat, msg) => cmd.playerOnline(bot, msg)),
};  

module.exports = (function() {
    return function(client, bot, dirUser, chat, sender) {
        const messageListener = async (msg) => {
            if(msg.from != sender) return;

            let pesan = msg.body;

            const text = msg.body.toLowerCase() || '';

            const funcName = text.replace('/', '').trim().split(' ');

            const value = cutVal(pesan, 1);

            if (prefixFunctions[funcName[0]]) {
                console.game(value, `cmd:${ funcName[0] }`, sender, 'cmd');

                return prefixFunctions[funcName[0]](bot, sender, dirUser, chat, msg);
            } else {
                try {
                    bot.chat(pesan);
                } catch (err) {
                    console.gameError(err, sender);
                    return chat.sendMessage('Terjadi kesalahan saat mengirim pesan kamu...');
                }
            }
        }

        client.addListener('message', messageListener);

        require('mineflayer-listener/end')(client, bot, dirUser, chat, sender, messageListener);
    };
})();