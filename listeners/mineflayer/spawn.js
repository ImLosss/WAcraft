require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { startTimeoutDc, stopTimeoutDc } = require('function/timeout');

module.exports = (function() {
    return function(bot, dirUser, msg, chat, sender, config) {
        bot.on("spawn", () => {
            console.log("Bot spawned, physics enabled");
            bot.physicsEnabled = true
        })
    };
})();