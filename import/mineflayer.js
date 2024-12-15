require('module-alias/register');

module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender) {
        require('mineflayer-listener/subtitle')(bot, chat, msg);
        require('mineflayer-listener/title')(bot, chat, msg);
        require('mineflayer-listener/messagestr')(bot, dirUser, msg, chat, sender);
        require('mineflayer-listener/login')(client, bot, dirUser, msg, chat, sender);
        require('mineflayer-listener/error')(bot, msg, dirUser, sender);
        require('mineflayer-listener/kicked')(bot, msg, sender);
    };
})();