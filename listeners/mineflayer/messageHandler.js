require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling, cutVal, checkCommandStatus } = require('function/function');
const cmd = require('import/CommandImportMineflayer');

const prefixFunctions = {
    'dc': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { bot.quit() }),
    'playerlist': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.playerOnline(bot, msg)),
    'afkfish': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.fishing(bot, msg, sender, value)),
    'inventory': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(cmd.getInventory(bot)); }),
    'throw': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(cmd.throwItem(bot, msg)) }),
    'equip': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(cmd.equipItem(bot, msg)) }),
    'health': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(`Health: ${ Math.round(bot.health) }`); }),
    'exp': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(`Exp: ${ bot.experience.points }`); }),
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
                
                if(!checkCommandStatus(funcName[0])) return msg.reply(`Command */${ funcName[0] }* dinonaktifkan`);
                return prefixFunctions[funcName[0]](bot, sender, dirUser, chat, msg, value);
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