require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');

module.exports = (function() {
    return function(client, bot, dirUser, chat, sender) {
        const messageListener = async (msg) => {
            if(msg.from != sender) return;
            if (msg.body == '/dc') bot.quit();
        }

        client.addListener('message', messageListener);

        require('mineflayer-listener/end')(client, bot, dirUser, chat, sender, messageListener);
    };
})();