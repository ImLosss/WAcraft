const mineflayer = require('mineflayer');
const { mapDownloader } = require('mineflayer-item-map-downloader');
const fs = require('fs');
const path = require('path');
const { autoRightClickOff, autoLeftClickOff, injectTitle } = require('./function');
const fungsi = require('./fungsi');
const { MessageMedia } = require('whatsapp-web.js');
const { getInventory, throwItem, donate, automsg, findBlock, listener, archer, afkfarm, equipItem } = require('../app/function/Mineflayer');
const { fishing2 } = require('./fishing2');
const { afkFishOf } = require('../app/function/fishing');



async function joinServer(msg, sender, client) {
    let repeatIntervalBroadcast, Lmessagestr, title, subtitle, list2, timeoutDc, timeoutChat, watcherDirMap;
    const chat = await msg.getChat();
    try {
        if(chat.isGroup) return msg.reply('Fitur hanya bisa digunakan di private Chat');
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);
        let config = fs.readFileSync(`./config.json`, 'utf-8');
        config = JSON.parse(config);

        if(dataUser[0].status == 'online') return chat.sendMessage('Anda sedang Online, kirim /dc untuk disconnect');
        if(dataUser[0].ip == undefined) return msg.reply('silahkan atur IP anda terlebih dahulu, dengan format */setip [ip]*');
        if(dataUser[0].username == undefined) return msg.reply('silahkan atur username anda terlebih dahulu, dengan format */setuser [username]*');
        if(dataUser[0].reconnectTime >= 5) {
            dataUser[0].reconnectTime = 0;
            fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
            return chat.sendMessage('Gagal join ke server...');
        }

        const ip = dataUser[0].ip;
        if (dataUser[1] == undefined) dataUser[1] = {};
        if(!dataUser[1][ip]) return msg.reply(`Sebelum join ke server, Anda *diwajibkan* untuk mengatur username asli yang anda mainkan(bukan akun alt/afk) di server ${ dataUser[0].ip } terlebih dahulu.\nKirim pesan dengan format:\n*/setRealUser [username_asli]*\n\n_Hal ini diperlukan karena semua user yg join menggunakan bot ini akan memiliki ip yg sama, untuk melihat info akun anda kirim */info*_.`);
        fungsi.cekAlt(sender);

        const filePathMap = `database/map/${ sender }`;

        if(!fs.existsSync(filePathMap)) {
            fs.mkdirSync(filePathMap);
        }
        
        const bot = mineflayer.createBot({
            host: ip, 
            username: dataUser[0].username, 
            auth: 'offline',
            "mapDownloader-outputDir": filePathMap
        })

        bot.loadPlugin(mapDownloader)

        injectTitle(bot);

        watcherDirMap = fs.watch(filePathMap, (eventType, filename) => {
            if (eventType === 'change') {
                console.log('file changed');
                const dir = `${ filePathMap }/map_000000.png`;
                try {
                    const media = MessageMedia.fromFilePath(dir);
                    chat.sendMessage(media).catch((err) => { chat.sendMessage('Error ketika mengirim file image map') });
                } catch (err) {
                    console.log('Error sending image map: ' . err)
                }

                setTimeout(() => {
                    fs.readdir(filePathMap, (err, files) => {
                        if (err) {
                            console.error('Error reading directory:', err);
                            return;
                        }
                
                        files.forEach(file => {
                            const filePath = path.join(filePathMap, file);
                
                            fs.unlink(filePath, err => {
                                if (err) {
                                    console.error('Error deleting file:', filePath, err);
                                } else {
                                    console.log('File deleted:', filePath);
                                }
                            });
                        });
                    });
                }, 5000);
            }
        });

        let message = ''
        Lmessagestr = async (msgstr) => {
            if(msgstr.trim().length == 0 || message == msgstr) return;

            msgstr = msgstr.trim();

            // menambah timeout untuk disconnect jika tidak terdapat aktivitas
            clearTimeout(timeoutDc);
            timeoutDc =  setTimeout(() => {
                chat.sendMessage('*Tidak terdapat pesan selama 15 menit. Disconnect dari server...*');
                bot.quit();
            }, 1000*60*15);

            message = msgstr;
            let except = [];
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if (msgstr.includes(`who ${ dataUser[0].username }`)) bot.chat(`Im ${ dataUser[1][ip].realUser }`);
            if(dataUser[0].except != undefined) except = dataUser[0].except;
            if(except.some(pre => msgstr.includes(pre))) return chat.sendMessage(msgstr);
            if(!dataUser[0].chatPublic) return;
            chat.sendMessage(msgstr).catch((err) => { console.log('error saat mengirim pesan') });
        }

        title = async (text) => {
            try {
                text = JSON.parse(text);
                if(text.text == "") return;

                chat.sendMessage(`Title: ${ text.text }`);
            } catch (err) {
                console.log('Error title: ' . err);
            }
        }

        subtitle = async (text) => {
            try {
                text = JSON.parse(text);
                if(text.text == "") return;

                chat.sendMessage(`Subtitle: ${ text.text }`);
            } catch (err) {
                console.log('Error subtitle: ' . err);
            }
        }

        bot.once('spawn', async () => {
            chat.sendMessage(`Connected`);
            listener(bot, msg);
            let dataUser = fungsi.getDataUser(sender);
            if(dataUser[0].reconnectTime == 0 && config.broadcast.status) donate(msg, config, sender);
            // if(dataUser[0].status == 'offline') {
                sendMsg(client, bot, msg, sender, chat);
                dataUser[0].status = 'online';
                dataUser[0].statusRepeat = true;
                dataUser[0].reconnectTime = 0;
                fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
            // }

            if(dataUser[0].autocmd != undefined && dataUser[0].autocmd.length > 0) {
                let array = dataUser[0].autocmd;
                let repeatCmd = 0;
        
                const repeatInterval = setInterval(() => {
                    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
                    dataUser = JSON.parse(dataUser);
                    if(dataUser[0].statusRepeat) {
                        const command = array[repeatCmd].toLowerCase();
                        chat.sendMessage(`*mengirim pesan ${ command }*`);
                        if (command == '/survival') {
                            bot.setQuickBarSlot(0);
                            bot.activateItem(false);
                            bot.once('windowOpen', (items) => {
                                bot.clickWindow(11, 0, 0);
                            });
                        } else if (command.startsWith('/automsg')) automsg(bot, msg, command, sender);
                        else if (command.startsWith('/autorightclick')) autoRightClick(bot, msg, command, sender);
                        else if (command.startsWith('/autoleftclick')) autoLeftClick(bot, msg, command, sender);
                        else if (command.startsWith('/afkfarm')) afkfarm(bot, msg, command, sender);
                        else if (command == '/afkfish on') fishing2(bot, msg, sender);
                        else bot.chat(array[repeatCmd]);
                        repeatCmd +=1;
                        if (repeatCmd == array.length) clearInterval(repeatInterval);
                    } else clearInterval(repeatInterval);
                }, 5000);
            }

            let repeatTimeoutBroadcast = config.broadcast.repeatInSec * 1000;
            let broadcastMessageArr = config.broadcast.message;
            let repeatIndex = 0
            repeatIntervalBroadcast = setInterval(() => {
                let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
                dataUser = JSON.parse(dataUser);
                if(dataUser[0].status == "online") {
                    if(!dataUser[0].chatPublic) return;
                    const message = broadcastMessageArr[repeatIndex];
                    chat.sendMessage(`> ⓘ _${ message }_`);

                    repeatIndex+=1;
                    if (repeatIndex == broadcastMessageArr.length) repeatIndex = 0;
                } else {
                    clearInterval(repeatInterval);
                }
            }, repeatTimeoutBroadcast);
        });

        bot.once('kicked', (msgK) => {
            try {
                msgK = JSON.parse(msgK);
                let time = fungsi.getTime();
                console.log(`(${ time }) Kicked: ${ JSON.stringify(msgK) }`);
                if (msgK.text != undefined && msgK.text != '') msg.reply(`Kicked : ${ msgK.text }`).catch(() => { chat.sendMessage(`Kicked : ${ msgK.text }`) });
                if (msgK.translate != undefined) msg.reply(`Kicked : ${ msgK.translate }`).catch(() => { chat.sendMessage(`Kicked : ${ msgK.translate }`) });
                if (msgK.extra != undefined) {
                    let strKick = '';
                    msgK.extra.map((item) => {
                        if(item.text != undefined) strKick += item.text;
                    })
                    msg.reply(`Kicked : ${ strKick }`).catch(() => { chat.sendMessage(`Kicked : ${ strKick }`) });
                }
                bot.quit();
            } catch (e) {
                console.log(e);
                msg.reply(`Terjadi kesalahan, coba kembali...`).catch(() => { chat.sendMessage(`terjadi kesalahan coba kembali, coba kembali...`) });
            }
        })

        bot.once('error', (e) => {
            try {
                let time = fungsi.getTime();
                let dataUser = fungsi.getDataUser(sender);
                console.log(`(${ time }, ${ dataUser[0].username }) Lerror: code(${ e.code }) (${ e })`);
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
                else msg.reply('Disconnect, Coba kembali...').catch(() => { chat.sendMessage('Disconnect, Coba kembali') });
                if (dataUser[0].status == 'online') bot.quit();
            } catch (e) {
                console.log(e);
                msg.reply(`Terjadi kesalahan, coba kembali...`).catch(() => { chat.sendMessage(`Terjadi kesalahan, coba kembali...`) });
            }
        })

        bot.once('end', (msgEnd) => {
            console.log(`End: ${ msgEnd }`);
            clearTimeout(timeoutDc);
            clearTimeout(timeoutChat);
            clearInterval(repeatIntervalBroadcast);
            const numListenersMessageBeforeRemoval = client.listeners('message').length;
            const numListenersSubtitleBeforeRemoval = bot.listeners('subtitle').length;
            const numListenersTitleBeforeRemoval = bot.listeners('title').length;
            console.log(`Jumlah listener message sebelum dihapus : ${ numListenersMessageBeforeRemoval }`);
            console.log(`Jumlah listener title sebelum dihapus : ${ numListenersTitleBeforeRemoval }`);
            console.log(`Jumlah listener subtitle message sebelum dihapus : ${ numListenersSubtitleBeforeRemoval }`);
            try{
                bot.removeListener('messagestr', Lmessagestr);
                bot.removeListener('title', title);
                bot.removeListener('subtitle', subtitle);
                client.removeListener('message', list2);
                const numListenersMessageAfterRemoval = client.listeners('message').length;
                const numListenersSubtitleAfterRemoval = bot.listeners('subtitle').length;
                const numListenersTitleAfterRemoval = bot.listeners('title').length;
                console.log(`Jumlah listener message setelah dihapus : ${  numListenersMessageAfterRemoval }`);
                console.log(`Jumlah listener title setelah dihapus : ${  numListenersTitleAfterRemoval }`);
                console.log(`Jumlah listener subtitle setelah dihapus : ${  numListenersSubtitleAfterRemoval }`);
            } catch (e) {
                console.log(`Gagal hapus listener : ${ e }`);
            }

            try {
                watcherDirMap.close();
            } catch (err) {
                console.log('Error ketika menghapus listener map: ' . err);
            }

            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            dataUser[0].status = 'offline';
            dataUser[0].autorightclick = false;
            dataUser[0].autoleftclick = false;
            dataUser[0].afkfarm = false;
            dataUser[0].afkfish = false;
            dataUser[0].statusRepeat = false;
            if(dataUser[0].automsg != undefined) {
                dataUser[0].automsg.status = false;
            }

            if(dataUser[0].autoReconnect) {
                dataUser[0].reconnectTime+=1;
                fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
                msg.reply(`*Reconnect after 15 seconds... (${ dataUser[0].reconnectTime }/5)*`).catch(() => { chat.sendMessage(`*Reconnect after 15 seconds... ${ dataUser[0].reconnectTime }*`) })
                setTimeout(() => {
                    joinServer(msg, sender, client);
                }, 15000);
            } else {
                dataUser[0].chatPublic = true;
                chat.sendMessage('Disconnect');
                fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
            }
        });

        bot.addListener('messagestr', Lmessagestr);
        bot.addListener('title', title);
        bot.addListener('subtitle', subtitle);

        function sendMsg(client, bot, msg5, sender, chat) {
            list2 = async (msg2) => {
                if(msg2.from == sender) {
                    const send = msg2.body;
                    const pesan = send.toLowerCase() || '';
                    console.log(pesan);
                    if (pesan == '/dc') { 
                        bot.quit();
                        return;
                    } else if (pesan == '/survival') {
                        bot.setQuickBarSlot(0);
                        bot.activateItem(false);
                        bot.once('windowOpen', (items) => {
                            bot.clickWindow(11, 0, 0);
                        });
                    } else if (pesan.startsWith('/automsg')) {
                        automsg(bot, msg5, pesan, sender);
                    } else if(pesan == '/playerlist') {
                        playerOnline(bot, msg5);
                    } else if(pesan.startsWith('/autorightclick')) {
                        autoRightClick(bot, msg5, pesan, sender);
                    } else if(pesan.startsWith('/autoleftclick')) {
                        autoLeftClick(bot, msg5, pesan, sender);
                    } else if(pesan.startsWith('/afkfarm')) {
                        afkfarm(bot, msg5, pesan, sender);
                    } else if(pesan == '/ping') {
                        chat.sendMessage(`*Ping:* ${ bot.player.ping }`);
                    } else if(pesan == '/afkfish on') {
                        fishing2(bot, msg5, sender);
                    } else if(pesan == '/afkfish of' || pesan == '/afkfish off') {
                        afkFishOf(msg5, sender);
                    } else if(pesan == '/inventory') {
                        chat.sendMessage(getInventory(bot, msg2));
                    } else if(pesan.startsWith('/throw')) {
                        chat.sendMessage(throwItem(bot, msg2));
                    } else if(pesan.startsWith('/equip')) {
                        chat.sendMessage(equipItem(bot, msg2));
                    } else if(pesan == '/health') {
                        const health = Math.round(bot.health);
                        chat.sendMessage(`Health: ${ health }`);
                    } else if(pesan == '/exp') {
                        const exp = bot.experience.points;
                        chat.sendMessage(`Exp: ${ exp }`);
                    } else if(pesan.startsWith('/find')) {
                        findBlock(bot, msg2, pesan);
                    } else if(pesan.startsWith('find')) {
                        return;
                    } else if(pesan.startsWith('/afkarcher')) {
                        archer(bot, msg2, pesan, sender);
                    } else {
                        try {
                            bot.chat(send);
                        } catch (err) {
                            chat.sendMessage('_Terjadi kesalahan saat mengirim pesan anda..._')
                        }
                    }

                    // menambah timeout untuk chat of jika tidak terdapat aktivitas
                    clearTimeout(timeoutChat);
                    timeoutChat =  setTimeout(() => {
                        let dataUser = fungsi.getDataUser(sender);
                        if(dataUser[0].chatPublic) {
                            fungsi.chatOff(sender)
                            chat.sendMessage('*Tidak terdapat pesan yang dikirim selama 1 jam, mematikan chat untuk menghindari spam bot. Kirim _/chat on_ untuk menyalakan chat kembali...*\n\n_Note:_\n_pesan yang dikirim ke chat ini akan tetap dikirim ke game meskipun chat telah dimatikan_')
                            .then(() => {
                                chat.sendMessage('*Anda dapat menggunakan fitur filter chat agar tetap dapat menerima pesan saat chat diatur ke of (_/tellme [pesan]_)*\n\nContoh:\n*_/tellme Obtained_*');
                            });
                        }
                    }, 1000*60*60);
                }
            }
            client.addListener('message', list2);

            timeoutChat =  setTimeout(() => {
                let dataUser = fungsi.getDataUser(sender);
                if(dataUser[0].chatPublic) {
                    fungsi.chatOff(sender)
                    chat.sendMessage('*Tidak terdapat pesan yang dikirim selama 1 jam, mematikan chat untuk menghindari spam bot. Kirim _/chat on_ untuk menyalakan chat kembali...*\n\n_Note:_\n_pesan yang dikirim ke chat ini akan tetap dikirim ke game meskipun chat telah dimatikan_')
                    .then(() => {
                        chat.sendMessage('*Anda dapat menggunakan fitur filter chat agar tetap dapat menerima pesan saat chat diatur ke of (_/tellme [pesan]_)*\n\nContoh:\n*_/tellme Obtained_*');
                    });
                }
            }, 1000*60*60);
        }
    } catch (err) {
        console.log(err);
        chat.sendMessage('Error');
    }
}

async function playerOnline(bot, msg) {
    try {
        const chat = await msg.getChat();
        let player = [];
        for (const playerName in bot.players) {
            player.push(playerName);
        }
        let jml = player.length;
        player = player.join(', ');

        return msg.reply(`*Players Online(${ jml }):*\n\n${ player }`).catch(() => { chat.sendMessage(`*Players Online:*\n\n${ player }`) });
    } catch(e) {
        const chat = await msg.getChat();
        console.log(e);
        msg.reply('terjadi kesalahan').catch(() => { chat.sendMessage('terjadi kesalahan') });
    }
}

async function autoRightClick(bot, msg, pesan, sender) {
    try {
        const chat = await msg.getChat();
        if(pesan == '/autorightclick of' || pesan == '/autorightclick of') {
            autoRightClickOff(msg, sender);
            return;
        };
        pesan = pesan.split(' ');
        if(pesan.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */autorightclick [time_in_sec]*');
        let time = pesan[1];

        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].autorightclick) return msg.reply('autorightclick masih aktif, kirim */autorightclick of* untuk menonaktifkannya');

        if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */autorightclick [time_in_sec]*');
        let time2 = time * 1000;
        console.log(time2);
        dataUser[0].autorightclick = true;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
        chat.sendMessage(`*Berhasil mengaktifkan autorightclick tiap ${ time } Detik*`);
        const intval2 = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(dataUser[0].autorightclick) {
                bot.activateItem();
            } else clearInterval(intval2);
        }, time2);

        let cekautorightclick = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(!dataUser[0].autorightclick) { 
                clearInterval(cekautorightclick);
                clearInterval(intval2);
                msg.reply('*Berhasil menonaktifkan autoRightClick*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan autoRightClick*') });
            }
        }, 2000);
    } catch(e) {
        console.log(e);
    }
}

async function autoLeftClick(bot, msg, pesan, sender) {
    try {
        const chat = await msg.getChat();
        if(pesan == '/autoleftclick of' || pesan == '/autoleftclick off') {
            autoLeftClickOff(msg, sender);
            return;
        };
        pesan = pesan.split(' ');
        if(pesan.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */autoleftclick [time_in_sec]*');
        let time = pesan[1];

        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].autoleftclick) return msg.reply('autoleftclick masih aktif, kirim */autoleftclick of* untuk menonaktifkannya');

        if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */autoleftclick [time_in_sec]*');
        let time2 = time * 1000;
        console.log(time2);
        dataUser[0].autoleftclick = true;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
        chat.sendMessage(`*Berhasil mengaktifkan autoleftclick tiap ${ time } Detik*`);
        const intval2 = setInterval(async () => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(dataUser[0].autoleftclick) {
                // const entity = bot.entityAtCursor(5);
                // if (entity && entity.kind != "UNKNOWN" && entity.kind != undefined)  {
                //     bot.attack(entity);
                // }
                // else bot.swingArm();

                const entity = bot.nearestEntity(entity => {
                    if (!entity.type) return;
                    const type = entity.type;
                    return type === 'hostile' || type === 'animal' || type === 'mob';
                });

                if(entity) {
                    const position = entity.position.offset(0, 0.5, 0);
                    await bot.lookAt(position)
                    bot.attack(entity);
                }
            } else clearInterval(intval2);
        }, time2);

        let cekautoleftclick = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(!dataUser[0].autoleftclick) { 
                clearInterval(cekautoleftclick);
                clearInterval(intval2);
                msg.reply('*Berhasil menonaktifkan autoLeftClick*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan autoLeftClick*') });
            }
        }, 2000);
    } catch(e) {
        console.log(e);
    }
}

module.exports = {
    joinServer
}