require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { startBroadcast } = require('service/MineflayerService');

module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender) {
        bot.once('login', withErrorHandling(async () => {
            let config = readJSONFileSync('config.json');
            let dataUser = readJSONFileSync(dirUser);

            dataUser[0].status = "online";
            writeJSONFileSync(dirUser, dataUser);

            startBroadcast(sender, config, chat);

            require('mineflayer-listener/messageHandler')(client, bot, dirUser, chat, sender);
        }, msg, bot))
    };
})();