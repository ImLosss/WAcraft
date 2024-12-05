require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { startBroadcast } = require('../../app/service/MineflayerService');

module.exports = (function() {
    return function(bot, dirUser, msg, chat, sender) {
        bot.once('login', withErrorHandling(async () => {
            let config = readJSONFileSync('config.json');
            let dataUser = readJSONFileSync(dirUser);

            dataUser[0].status = "online";
            writeJSONFileSync(dirUser, dataUser);

            startBroadcast(sender, config, chat);
        }, msg))
    };
})();