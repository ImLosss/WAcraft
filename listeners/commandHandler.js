require('module-alias/register');
const fs = require('fs');
const console = require('console');
const { cutVal } = require("function/function");
const { writeJSONFileSync, readJSONFileSync } = require('utils');

module.exports = (function() {
    return function(bot) {
        bot.on('message', async (msg) => {
            const prefixFunctionsAdmin = {
                'backup': (msg, sender, client, arg) => backup_database('database', 'database.zip', client),
                'sendmsg': (msg, sender, client, arg) => sendMsg(msg, client),
                'sendupdate': (msg, sender, client, arg) => sendUpdate(msg, client),
                'sendmsgall': (msg, sender, client, arg) => sendMsgAll(msg, client),
                'addwhitelist': (msg, sender, client, arg) => addWhitelist(msg, client),
                'addblacklist': (msg, sender, client, arg) => addBlacklist(msg, client),
                'maintenance': (msg, sender, client, arg) => maintenance(msg),
                'delblacklist': (msg, sender, client, arg) => delBlacklist(msg, sender, client),
                'delwhitelist': (msg, sender, client, arg) => delWhitelist(msg, sender, client),
            }
            
            const prefixFunctions = {
                'update': (msg, sender, client, arg) => update(msg),
                'join': (msg, sender, client, arg) => joinServer(msg, sender, client),
                'dc': (msg, sender, client, arg) => disconnect(msg, sender),
                'cektellme': (msg, sender, client, arg) => cektellme(msg, sender),
                'cekautocmd': (msg, sender, client, arg) => fungsi.cekautocmd(msg, sender),
                'chat': (msg, sender, client, arg) => chatPublic(msg, sender),
                'setip': (msg, sender, client, arg) => setIp(msg, sender),
                'setver': (msg, sender, client, arg) => setVer(msg, sender),
                'setuser': (msg, sender, client, arg) => setUser(msg, sender),
                'setautomsg': (msg, sender, client, arg) => setAutoMsg(msg, sender),
                'tellme': (msg, sender, client, arg) => tellme(msg, sender),
                'deltellme': (msg, sender, client, arg) => delltellme(msg, sender),
                'autocmd': (msg, sender, client, arg) => autocmd(msg, sender),
                'delautocmd': (msg, sender, client, arg) => delautocmd(msg, sender),
                'autoreconnect': (msg, sender, client, arg) => setAutoReconnect(msg, sender),
                'setrealuser': (msg, sender, client, arg) => setRealUser(msg, sender),
                'info': (msg, sender, client, arg) => cekInfo(msg, sender),
                'bugreport': (msg, sender, client, arg) => bugReport(msg, client, sender),
                'getinfouser': (msg, sender, client, arg) => getInfoUser(msg, client),
            };    
            
            const prefix = ['/', '!'];

            let config = readJSONFileSync(`./config.json`);

            const chat = await msg.getChat();

            chat.sendSeen();
            bot.sendPresenceAvailable();

            const text = msg.body.toLowerCase() || '';

            let sender = msg.from;

            const dir_data_user = `./database/data_user/${ sender }`
            if(!fs.existsSync(dir_data_user)) {
                let data_user = [{
                    chatPublic: true,
                    chatPrivate: true,
                    status: "offline"
                }]
                writeJSONFileSync(dir_data_user, data_user);
            }

            console.log(msg.body, `MessageFrom:${ chat.name }`);
            const value = cutVal(msg.body, 1);

            if(!chat.isGroup) {
                if (prefix.some(pre => text == `${pre}menu`)) return msg.reply(menu, { linkPreview: false });

                for (const pre of prefix) {
                    if (text.startsWith(`${pre}`)) {
                        const funcName = text.replace(pre, '').trim().split(' ');

                        if(prefixFunctions[funcName[0]] && config.blacklist.includes(sender)) return chat.sendMessage("Maaf nomor anda telah di blacklist. Anda tidak dapat menggunakan bot ini lagi");
                    
                        if(config.maintenance) {
                            const whitelist = config.maintenanceWhitelist;
                            if(prefixFunctions[funcName[0]] && !whitelist.includes(sender)) {
                                return msg.reply('Bot sedang melakukan pengujian fitur, Anda tidak termasuk dalam whitelist!');
                            }
                        }

                        if (prefixFunctions[funcName[0]]) {     
                            console.log(value, `cmd:${ funcName[0] }`);
                            return prefixFunctions[funcName[0]](msg, sender, bot, value, chat);
                        } else if (prefixFunctionsAdmin[funcName[0]] && sender == config.owner) {
                            return prefixFunctionsAdmin[funcName[0]](msg, sender, client, text);
                        }
                    }
                }
            }
        });
    };
})();