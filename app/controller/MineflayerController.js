require('module-alias/register');
const console = require('console');
const mineflayer = require('mineflayer');
const { withErrorHandling } = require('function/function');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const { cekAlt, injectTitle, listener } = require('service/MineflayerService');
const { mapDownloader } = require('mineflayer-item-map-downloader');

const joinServer = withErrorHandling(async (msg, sender, client) => {
    let repeatIntervalBroadcast, Lmessagestr, title, subtitle, list2, timeoutDc, timeoutChat, watcherDirMap;
    const chat = await msg.getChat();
    const dirUser = `./database/data_user/${ sender }`

    if(chat.isGroup) return msg.reply('Fitur hanya bisa digunakan di private Chat');

    let dataUser = readJSONFileSync(dirUser);
    let config = readJSONFileSync(`./config.json`);

    if(dataUser[0].status == 'online') return chat.sendMessage('Anda sedang Online, kirim /dc untuk disconnect');
    if(dataUser[0].ip == undefined) return msg.reply('silahkan atur IP anda terlebih dahulu, dengan format */setip <ip>*');
    if(dataUser[0].username == undefined) return msg.reply('silahkan atur username anda terlebih dahulu, dengan format */setuser <username>*');
    if(dataUser[0].reconnectTime >= 5) {
        dataUser[0].reconnectTime = 0;
        writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
        return chat.sendMessage('Gagal join ke server...');
    }

    const ip = dataUser[0].ip;
    if (dataUser[1] == undefined) dataUser[1] = {};
    if(!dataUser[1][ip]) return msg.reply(`Sebelum join ke server, Anda *diwajibkan* untuk mengatur username asli yang anda mainkan(bukan akun alt/afk) di server ${ dataUser[0].ip } terlebih dahulu.\nKirim pesan dengan format:\n*/setRealUser <username_asli>*\n\n_Hal ini diperlukan karena semua user yg join menggunakan bot ini akan memiliki ip yg sama, untuk melihat info akun anda kirim */info*_.`);
    if(!dataUser[1][ip].version) return msg.reply(`Atur versi minecraft yang ingin kamu mainkan di server ${ dataUser[0].ip }. Kirim */setver <version>* untuk mengatur versi.\nContoh: /setver 1.20\nList Version:\n- 1.17\n- 1.18\n- 1.19\n- 1.20`)
    cekAlt(sender);

    const filePathMap = `database/map/${ sender }`;

    if(!fs.existsSync(filePathMap)) {
        fs.mkdirSync(filePathMap);
    }
    
    const bot = mineflayer.createBot({
        host: ip, 
        username: dataUser[0].username, 
        auth: 'offline',
        version: dataUser[1][ip].version,
        "mapDownloader-outputDir": filePathMap
    })

    bot.loadPlugin(mapDownloader)

    injectTitle(bot);

    watcherDirMap = fs.watch(filePathMap, (eventType, filename) => {
        if (eventType === 'change') {
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
                        console.error(err);
                        return;
                    }
            
                    files.forEach(file => {
                        const filePath = path.join(filePathMap, file);
            
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error(`Error deleting file: ${ filePath }, ${ err.message }`);
                            } else {
                                console.game(`File deleted: ${ filePath }`, sender, 'delete_map');
                            }
                        });
                    });
                });
            }, 5000);
        }
    });

    bot.once('login', async () => {
        try {
            chat.sendMessage(`Connected`);
            listener(bot, msg);
            let dataUser = readJSONFileSync(dirUser);
            if(dataUser[0].reconnectTime == 0 && config.broadcast.status) donate(msg, config, sender);
            sendMsg(client, bot, msg, sender, chat);
            dataUser[0].status = 'online';
            dataUser[0].statusRepeat = true;
            dataUser[0].reconnectTime = 0;
            writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

            if(dataUser[0].autocmd != undefined && dataUser[0].autocmd.length > 0) {
                let array = dataUser[0].autocmd;
                let repeatCmd = 0;
        
                const repeatInterval = setInterval(() => {
                    let dataUser = readJSONFileSync(dirUser);
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
                let dataUser = readJSONFileSync(dirUser);
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
        } catch (err) { 
            bot.quit();
            console.error(err);
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
        let dataUser = readJSONFileSync(dirUser);
        if (msgstr.includes(`who ${ dataUser[0].username }`)) bot.chat(`Im ${ dataUser[1][ip].realUser }`);
        if(dataUser[0].except != undefined) except = dataUser[0].except;
        if(except.some(pre => msgstr.includes(pre))) return chat.sendMessage(msgstr);
        if(!dataUser[0].chatPublic) return;
        console.game(msgstr, sender);
        chat.sendMessage(msgstr).catch((err) => { console.gameError('error saat mengirim pesan') });
    }

    title = async (text) => {
        try {
            text = (() => { try { return JSON.parse(text); } catch { return text; } })();
            if (text.value?.text?.value && text.value?.text?.value != "") chat.sendMessage(`Title: ${ text.value.text.value }`);
            if (text.text && text.text != "") chat.sendMessage(`Title: ${ text.text }`);
        } catch (err) {
            console.log('Error title: ' . err);
        }
    }

    subtitle = async (text) => {
        try {
            text = (() => { try { return JSON.parse(text); } catch { return text; } })();
            if (text.value?.text?.value && text.value?.text?.value != "") chat.sendMessage(`Subtitle: ${ text.value.text.value }`);
            if (text.text && text.text != "") chat.sendMessage(`Subtitle: ${ text.text }`);
        } catch (err) {
            console.log('Error subtitle: ' . err);
        }
    }

    bot.once('end', (msgEnd) => {
        console.game(msgEnd, sender, 'Disconnect');
        clearTimeout(timeoutDc);
        clearTimeout(timeoutChat);
        clearInterval(repeatIntervalBroadcast);
        const numListenersMessageBeforeRemoval = bot.listeners('messagestr').length;
        console.log(`Jumlah listener subtitle message sebelum dihapus : ${ numListenersSubtitleBeforeRemoval }`);
        try{
            const numListenersMessageAfterRemoval = bot.listeners('messagestr').length;
            console.log(`Jumlah listener message setelah dihapus : ${  numListenersMessageAfterRemoval }`);
        } catch (e) {
            console.log(`Gagal hapus listener : ${ e }`);
        }

        try {
            watcherDirMap.close();
        } catch (err) {
            console.log('Error ketika menghapus listener map: ' . err);
        }

        let dataUser = readJSONFileSync(dirUser, sender);
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
            writeJSONFileSync(dirUser, dataUser);
            msg.reply(`*Reconnect after 15 seconds... (${ dataUser[0].reconnectTime }/5)*`).catch(() => { chat.sendMessage(`*Reconnect after 15 seconds... ${ dataUser[0].reconnectTime }*`) })
            setTimeout(() => {
                joinServer(msg, sender, client);
            }, 15000);
        } else {
            dataUser[0].chatPublic = true;
            chat.sendMessage('Disconnect');
            writeJSONFileSync(dirUser, dataUser);
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
})

module.exports = {
    joinServer
}