require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');

module.exports = (function() {
    return async function(bot, msg, dirUser, sender) {
        bot.once('error', (e) => {
            try {
                let dataUser = readJSONFileSync(dirUser);
                console.gameError(e, sender);
                if(e.code == "ENOTFOUND") msg.reply('IP mu sepertinya salah...').catch(( )=> { chat.sendMessage('IP mu sepertinya salah...') });
                else if(e.code == "ECONNRESET") msg.reply('Disconnect, Coba kembali...').catch(() => { chat.sendMessage('Disconnect, Coba kembali') });
                else if(e == "Error: ETIMEDOUT" && dataUser[0].status != 'online' && dataUser[0].autoReconnect) {
                    try{ 
                        bot.quit();
                    } catch (e) { console.log(e) }
                    chat.sendMessage('Gagal join ke server, mencoba join kembali...')
                    return;
                }
                else if(e == "Error: ETIMEDOUT") { chat.sendMessage('Gagal join ke server...') }
                else if(e.message.includes('This server is version')) msg.reply(e.message).catch(() => { chat.sendMessage(e.message) });
                else msg.reply('Disconnect, Coba kembali...').catch(() => { chat.sendMessage('Disconnect, Coba kembali') });
                if (dataUser[0].status == 'online') bot.quit();
            } catch (e) {
                console.gameError(e, sender);
                msg.reply(`Terjadi kesalahan, coba kembali...`).catch(() => { chat.sendMessage(`Terjadi kesalahan, coba kembali...`) });
            }
        })
    };
})();