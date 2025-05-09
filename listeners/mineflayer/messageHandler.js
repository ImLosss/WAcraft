require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling, cutVal, checkCommandStatus } = require('function/function');
const cmd = require('import/CommandImportMineflayer');
const { startTimeoutChat, stopTimeoutChat } = require('function/timeout');
const cache = require('cache');

const prefixFunctions = {
    'dc': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { bot.quit() }),
    'playerlist': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.playerOnline(bot, msg)),
    'afkfish': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.fishing(bot, msg, sender, value)),
    'afkarcher': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.archer(bot, msg, value, sender)),
    'autorightclick': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.autoRightClick(bot, msg, value, sender)),
    'autoleftclick': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.autoLeftClick(bot, msg, value, sender)),
    'automsg': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.automsg(bot, msg, value, sender, chat)),
    'find': withErrorHandling((bot, sender, dirUser, chat, msg, value) => cmd.findBlock(bot, msg, value)),
    'inventory': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(cmd.getInventory(bot)); }),
    'throw': withErrorHandling(async (bot, sender, dirUser, chat, msg, value) => {
        const response = await cmd.throwItem(bot, msg, value); // Tunggu hasil dari throwItem
        chat.sendMessage(response);
    }),
    'equip': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(cmd.equipItem(bot, msg, value)) }),
    'ping': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(`*Ping:* ${ bot.player.ping }`); }),
    'health': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(`Health: ${ Math.round(bot.health) }`); }),
    'exp': withErrorHandling((bot, sender, dirUser, chat, msg, value) => { chat.sendMessage(`Exp: ${ bot.experience.points }`); }),
};  

module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender, config) {
        startTimeoutChat(sender, config, chat, bot);
        const messageListener = async (msg) => {
            if(msg.from != sender) return;

            stopTimeoutChat(sender);
            startTimeoutChat(sender, config, chat, bot);

            let pesan = msg.body;

            const text = msg.body.toLowerCase() || '';

            const funcName = text.replace('/', '').trim().split(' ');

            const value = cutVal(pesan, 1);

            if (prefixFunctions[funcName[0]]) {
                console.game(value, sender, `cmd:${ funcName[0] }`);
                
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

        cache.set(`messageListener${ sender }`, messageListener);
    };
})();