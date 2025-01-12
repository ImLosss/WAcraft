require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { joinServer } = require('controller/MineflayerController');

module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender) {
        bot.once('end', async () => {
            let dataUser = readJSONFileSync(dirUser);
            if(dataUser[0].autoReconnect) {
                dataUser[0].reconnectTime+=1;
                writeJSONFileSync(dirUser, dataUser);
                msg.reply(`*Reconnect after 15 seconds... (${ dataUser[0].reconnectTime }/5)*`).catch(() => { chat.sendMessage(`*Reconnect after 15 seconds... (${ dataUser[0].reconnectTime }/5*)`) })
                setTimeout(() => {
                    joinServer(msg, sender, client);
                }, 15000);
            }
        })
    };
})();