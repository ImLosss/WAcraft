require('module-alias/register');
const { withErrorHandling } = require('function/function');

module.exports = (function() {
    return async function(bot, chat, msg) {
        bot.on('subtitle', withErrorHandling((text) => {
            try {
                text = (() => { try { return JSON.parse(text); } catch { return text; } })();
                if (text.value?.text?.value?.trim() && text.value?.text?.value.trim() != "") chat.sendMessage(`Subtitle: ${ text.value.text.value }`);
                if (text.text?.trim() != "") chat.sendMessage(`Subtitle: ${ text.text }`);
            } catch (err) {
                console.log('Error subtitle: ' . err);
            }
        }, msg))
    };
})();