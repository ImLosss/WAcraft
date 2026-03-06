require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { startTimeoutDc, stopTimeoutDc } = require('function/timeout');

module.exports = (function() {
    return function(bot, dirUser, msg, chat, sender, config) {
        bot.on("spawn", () => {
            bot.physicsEnabled = true
        })
    };
})();