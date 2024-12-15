require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');

module.exports = (function() {
    return async function(bot, msg, sender) {
        bot.once('kicked', (msgK) => {
            try {
                msgK = (() => { try { return JSON.parse(msgK); } catch { return msgK; } })();
                console.game(`Kicked: ${ JSON.stringify(msgK) }`, sender);
                if (msgK.text != undefined && msgK.text != '') msg.reply(`Kicked : ${ msgK.text }`).catch(() => { chat.sendMessage(`Kicked : ${ msgK.text }`) });
                if (msgK.translate != undefined) msg.reply(`Kicked : ${ msgK.translate }`).catch(() => { chat.sendMessage(`Kicked : ${ msgK.translate }`) });
                if (msgK.extra != undefined) {
                    let strKick = '';
                    msgK.extra.map((item) => {
                        if(item.text != undefined) strKick += item.text;
                    })
                    msg.reply(`Kicked : ${ strKick }`).catch(() => { chat.sendMessage(`Kicked : ${ strKick }`) });
                }
                if (msgK.value?.text?.value != undefined) msg.reply(`Kicked : ${ msgK.value.text.value }`).catch(() => { chat.sendMessage(`Kicked : ${ msgK.value.text.value}`) });
                bot.quit();
            } catch (e) {
                console.game(e, sender);
                msg.reply(`Terjadi kesalahan, coba kembali...`).catch(() => { chat.sendMessage(`terjadi kesalahan coba kembali, coba kembali...`) });
            }
        })
    };
})();