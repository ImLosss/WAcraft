require('module-alias/register');
const fs = require('fs');
const console = require('console');
const { cutVal, getMenu } = require("function/function");
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const cmd = require('command');
const { withErrorHandling } = require('../app/function/function');

module.exports = (function() {
    return function(client) {
        client.on('message', async (msg) => {
            const prefixFunctionsAdmin = {
                'backup': withErrorHandling((msg, sender, client, arg) => cmd.backup(msg, 'database', 'database.zip', client)),
                'sendmsg': withErrorHandling((msg, sender, client, arg) => cmd.sendMsg(msg, client, arg)),
                'sendupdate': withErrorHandling((msg, sender, client, arg) => cmd.sendUpdate(msg, client)),
                'sendmsgall': withErrorHandling((msg, sender, client, arg) => cmd.sendMsgAll(msg, client, arg)),
                'addwhitelist': withErrorHandling((msg, sender, client, arg) => cmd.addWhitelist(msg, client)),
                'addblacklist': withErrorHandling((msg, sender, client, arg) => cmd.addBlacklist(msg, client)),
                'maintenance': withErrorHandling((msg, sender, client, arg) => cmd.maintenance(msg)),
                'delblacklist': withErrorHandling((msg, sender, client, arg) => cmd.delBlacklist(msg, sender, client)),
                'delwhitelist': withErrorHandling((msg, sender, client, arg) => cmd.delWhitelist(msg, sender, client)),
            }
            
            const prefixFunctions = {
                'update': withErrorHandling((msg, sender, client, arg) => cmd.update(msg)),
                'join': withErrorHandling((msg, sender, client, arg) => cmd.joinServer(msg, sender, client)),
                'dc': withErrorHandling((msg, sender, client, arg) => disconnect(msg, sender)),
                'cektellme': withErrorHandling((msg, sender, client, arg) => cektellme(msg, sender)),
                'cekautocmd': withErrorHandling((msg, sender, client, arg) => fungsi.cekautocmd(msg, sender)),
                'chat': withErrorHandling((msg, sender, client, arg) => chatPublic(msg, sender)),
                'setip': withErrorHandling((msg, sender, client, arg) => setIp(msg, sender)),
                'setver': withErrorHandling((msg, sender, client, arg) => setVer(msg, sender)),
                'setuser': withErrorHandling((msg, sender, client, arg) => setUser(msg, sender)),
                'setautomsg': withErrorHandling((msg, sender, client, arg) => setAutoMsg(msg, sender)),
                'tellme': withErrorHandling((msg, sender, client, arg) => tellme(msg, sender)),
                'deltellme': withErrorHandling((msg, sender, client, arg) => delltellme(msg, sender)),
                'autocmd': withErrorHandling((msg, sender, client, arg) => autocmd(msg, sender)),
                'delautocmd': withErrorHandling((msg, sender, client, arg) => delautocmd(msg, sender)),
                'autoreconnect': withErrorHandling((msg, sender, client, arg) => setAutoReconnect(msg, sender)),
                'setrealuser': withErrorHandling((msg, sender, client, arg) => setRealUser(msg, sender)),
                'info': withErrorHandling((msg, sender, client, arg) => cekInfo(msg, sender)),
                'bugreport': withErrorHandling((msg, sender, client, arg) => bugReport(msg, client, sender)),
                'getinfouser': withErrorHandling((msg, sender, client, arg) => getInfoUser(msg, client)),
            };    
            
            const prefix = ['/', '!'];

            let config = readJSONFileSync(`./config.json`);

            const chat = await msg.getChat();

            chat.sendSeen();
            client.sendPresenceAvailable();

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

            if(msg.body != "")console.log(msg.body, `MessageFrom:${ chat.name }`);
            const value = cutVal(msg.body, 1);

            if(!chat.isGroup) {
                if (prefix.some(pre => text == `${pre}menu`)) return msg.reply(getMenu(dir_data_user));

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
                            return prefixFunctions[funcName[0]](msg, sender, client, value);
                        } else if (prefixFunctionsAdmin[funcName[0]] && sender == config.owner) {
                            return prefixFunctionsAdmin[funcName[0]](msg, sender, client, value);
                        }
                    }
                }
            }
        });
    };
})();