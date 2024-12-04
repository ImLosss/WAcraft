require('module-alias/register');

module.exports = (function() {
    return async function(bot, msg) {
        const chat = await msg.getChat();
        bot.on('health', () => {
            let health = bot.health;
            health = Math.round(health);

            if(health <= 5) chat.sendMessage(`> ⚠️ _Darah kamu sisa ${ health }_`);
        })

        bot.on('death', () => {
            chat.sendMessage('> ⚠️ _You Die_');
        })
    };
})();