require('module-alias/register');

module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender) {
        require('mineflayer-listener/messagestr')(bot, dirUser, msg, chat, sender);
        require('mineflayer-listener/login')(bot, dirUser, msg, chat, sender);
    };
})();