require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { startAutoCmd } = require('function/autocmd');
const { startBroadcast, donate } = require('service/MineflayerService');

module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender) {
        bot.once('login', withErrorHandling(async () => {
            chat.sendMessage(`Connected`);

            let config = readJSONFileSync('config.json');
            let dataUser = readJSONFileSync(dirUser);

            if(dataUser[0].reconnectTime == 0 && config.donate) donate(msg, config, sender);

            dataUser[0].status = "online";
            dataUser[0].reconnectTime = 0;
            writeJSONFileSync(dirUser, dataUser);

            if(dataUser[0].autocmd != undefined && dataUser[0].autocmd.length > 0) startAutoCmd(bot, dataUser, dirUser, sender, msg, chat, client);

            startBroadcast(sender, config, chat);

            require('mineflayer-listener/messageHandler')(client, bot, dirUser, msg, chat, sender);
        }, msg, bot))
    };
})();