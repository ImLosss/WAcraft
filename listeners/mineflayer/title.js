require('module-alias/register');

module.exports = (function() {
    return async function(bot, msg) {
        const chat = await msg.getChat();
        bot.on('title', (text) => {
            try {
                text = (() => { try { return JSON.parse(text); } catch { return text; } })();
                if (text.value?.text?.value?.trim() && text.value?.text?.value.trim() != "") chat.sendMessage(`Title: ${ text.value.text.value }`);
                if (text.text?.trim() != "") chat.sendMessage(`Title: ${ text.text }`);
            } catch (err) {
                console.log('Error Title: ' . err);
            }
        })
    };
})();