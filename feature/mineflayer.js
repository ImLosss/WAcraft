const mineflayer = require('mineflayer');
const fs = require('fs');
const { autoRightClickOff, afkFarmOf, afkFishOf } = require('./function');
const fish = require('./fishing');
const fungsi = require('./fungsi');

let Lmessagestr, list2;

async function joinServer(msg, sender, isAdmin, client) {
    const chat = await msg.getChat();
    try {
        if(chat.isGroup) return msg.reply('Fitur hanya bisa digunakan di private Chat');
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].status == 'online') return chat.sendMessage('Anda sedang Online, kirim /dc untuk disconnect');
        if(dataUser[0].ip == undefined) return msg.reply('silahkan atur IP anda terlebih dahulu, dengan format */setip [ip]*');
        if(dataUser[0].username == undefined) return msg.reply('silahkan atur username anda terlebih dahulu, dengan format */setuser [username]*');

        const ip = dataUser[0].ip;
        if(!dataUser[1][ip]) return msg.reply(`Sebelum join ke server, Anda *diwajibkan* untuk mengatur username asli yang anda mainkan(bukan akun alt/afk) di server ${ dataUser[0].ip } terlebih dahulu.\nKirim pesan dengan format:\n*/setRealUser [username_asli]*\n\n_Hal ini diperlukan karena semua user yg join menggunakan bot ini akan memiliki ip yg sama, untuk melihat info akun anda kirim */cekInfo*_.`);
        fungsi.cekAlt(sender);

        const bot = mineflayer.createBot({
            host: ip, 
            username: dataUser[0].username, 
            auth: 'offline'
        })

        let message = ''
        Lmessagestr = async (msgstr) => {
            if(msgstr == "" || message == msgstr) return;
            message = msgstr;
            let except = [];
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(dataUser[0].except != undefined) except = dataUser[0].except;
            if(except.some(pre => msgstr.includes(pre))) return chat.sendMessage(msgstr);
            if(!dataUser[0].chatPublic) return;
            chat.sendMessage(msgstr);
        }

        bot.once('spawn', async () => {
            let dataUser = fungsi.getDataUser(sender);
            // if(dataUser[0].status == 'offline') {
                sendMsg(client, bot, msg, sender, chat, isAdmin);
                dataUser[0].status = 'online';
                dataUser[0].statusRepeat = true;
                fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
            // }

            if(dataUser[0].autocmd != undefined && dataUser[0].autocmd.length > 0) {
                let array = dataUser[0].autocmd;
                let repeatCmd = 0;
        
                const repeatInterval = setInterval(() => {
                    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
                    dataUser = JSON.parse(dataUser);
                    if(dataUser[0].statusRepeat) {
                        chat.sendMessage(`*mengirim pesan ${ array[repeatCmd] }*`);
                        if (array[repeatCmd] == '/survival') {
                            bot.setQuickBarSlot(0);
                            bot.activateItem(false);
                            bot.once('windowOpen', (items) => {
                                bot.clickWindow(11, 0, 0);
                            });
                        } else if (array[repeatCmd].startsWith('/automsg')) automsg(bot, msg, array[repeatCmd], sender);
                        else if (array[repeatCmd].startsWith('/autorightclick')) autoRightClick(bot, msg, array[repeatCmd], sender);
                        else if (array[repeatCmd].startsWith('/afkfarm')) afkfarm(bot, msg, array[repeatCmd], sender);
                        else if (array[repeatCmd] == '/afkfish on') fish.fishing(bot, msg, sender);
                        else bot.chat(array[repeatCmd]);
                        repeatCmd +=1;
                        if (repeatCmd == array.length) clearInterval(repeatInterval);
                    } else clearInterval(repeatInterval);
                }, 5000);
            }
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
                console.log(`(${ time }, ${ dataUser[0].username }) Lerror: code(${ e.code }) (${ e })`);
                if(e.code == "ENOTFOUND") msg.reply('IP mu sepertinya salah...').catch(( )=> { chat.sendMessage('IP mu sepertinya salah...') });
                else if(e.code == "ECONNRESET") msg.reply('Disconnect, Coba kembali...').catch(() => { chat.sendMessage('Disconnect, Coba kembali') });
                else if(e == "Error: ETIMEDOUT") {
                    msg.reply('Gagal join ke server, mencoba join kembali...').catch(() => { chat.sendMessage('Gagal join ke server, mencoba join kembali...') });
                    joinServer(msg, sender, isAdmin, client);
                    return;
                }
                else msg.reply('Disconnect, Coba kembali...').catch(() => { chat.sendMessage('Disconnect, Coba kembali') });
                if (dataUser[0].status == 'online') bot.quit();
            } catch (e) {
                console.log(e);
                msg.reply(`Terjadi kesalahan, coba kembali...`).catch(() => { chat.sendMessage(`Terjadi kesalahan, coba kembali...`) });
            }
        })

        bot.once('end', (msgEnd) => {
            console.log(`End: ${ msgEnd }`);
            client.removeListener('message', list2);
            bot.removeListener('messagestr', Lmessagestr);

            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            dataUser[0].status = 'offline';
            dataUser[0].autorightclick = false;
            dataUser[0].afkfarm = false;
            dataUser[0].afkfish = false;
            dataUser[0].statusRepeat = false;
            if(dataUser[0].automsg != undefined) {
                dataUser[0].automsg.status = false;
            }

            if(dataUser[0].autoReconnect) {
                fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
                msg.reply('*Reconnect after 15 seconds...*').catch(() => { chat.sendMessage('*Reconnect after 15 seconds*') })
                setTimeout(() => {
                    joinServer(msg5, sender, isAdmin, client);
                    resolve('reconnect');
                }, 15000);
            } else {
                dataUser[0].chatPublic = true;
                chat.sendMessage('Disconnect');
                fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
                resolve('disconnect');
            }
        });

        bot.addListener('messagestr', Lmessagestr);
    } catch (err) {
        console.log(err);
        chat.sendMessage('Error');
    }
}

function sendMsg(client, bot, msg5, sender, chat, isAdmin) {
    return new Promise((resolve) => {
        list2 = async (msg2) => {
            if(msg2.from == sender) {
                const pesan = msg2.body;
                console.log(pesan);
                if (pesan == '/dc') { 
                    bot.quit();
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
                } else if(pesan.startsWith('/afkfarm')) {
                    afkfarm(bot, msg5, pesan, sender);
                } else if(pesan == '/ping') {
                    chat.sendMessage(`*Ping:* ${ bot.player.ping }`);
                } else if(pesan == '/afkfish on') {
                    fish.fishing(bot, msg5, sender);
                } else if(pesan == '/afkfish of' || pesan == '/afkfish off') {
                    afkFishOf(msg5, sender);
                } else {
                    bot.chat(msg2.body);
                }
            }
        }
        client.addListener('message', list2);
    });
}

async function automsg(bot, msg, pesan, sender) {
    try {
        const chat = await msg.getChat();
        if(pesan == '/automsg off' || pesan == '/automsg of') return;
        pesan = pesan.split(' ');
        if(pesan.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */automsg [time_in_min]*');
        let time = pesan[1];

        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].automsg == undefined) return msg.reply('Atur pesan automsg anda terlebih dahulu dengan cara mengirim pesan dengan format */setautomsg [message]*');
        if(dataUser[0].automsg.status) return msg.reply('automsg masih aktif, kirim */automsg of* untuk menonaktifkannya');

        if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */automsg [time_in_min]*');
        let time2 = time * 60000 + 1000;
        console.log(time2);
        dataUser[0].automsg.status = true;
        const auto = dataUser[0].automsg.message;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
        chat.sendMessage(`*Berhasil mengaktifkan automsg tiap ${ time } Menit*`);
        const intval = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(dataUser[0].automsg.status) {
                bot.chat(auto);
                if(dataUser[0].chatPublic) chat.sendMessage('*Berhasil mengirimkan automsg*');
            } else clearInterval(intval);
        }, time2);
        let cekautomsg = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(!dataUser[0].automsg.status) { 
                clearInterval(cekautomsg);
                clearInterval(intval);
                msg.reply('*Berhasil menonaktifkan automsg*').catch(() => { chat.sendMessage('Berhasil menonaktifkan automsg*') });
            }
        }, 2000);
    } catch(e) {
        console.log(e);
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

async function afkfarm(bot, msg, pesan, sender) {
    try {
        const chat = await msg.getChat();
        if(pesan == '/afkfarm of' || pesan == '/afkfarm of') {
            afkFarmOf(msg, sender);
            return;
        };
        pesan = pesan.split(' ');
        if(pesan.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */afkfarm [time_in_sec]*');
        let time = pesan[1];

        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].afkfarm) return msg.reply('afkfarm masih aktif, kirim */afkfarm of* untuk menonaktifkannya');

        if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */afkfarm [time_in_sec]*');
        let time2 = time * 1000;
        console.log(time2);
        dataUser[0].afkfarm = true;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
        chat.sendMessage(`*Berhasil mengaktifkan afkFarm tiap ${ time } Detik*`);
        const intval2 = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(dataUser[0].afkfarm) {
                const blockToActivate = bot.blockAt(bot.entity.position.offset(-3, 1, 0));
                bot.activateBlock(blockToActivate);
            } else clearInterval(intval2);
        }, time2);

        let cekafkfarm = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(!dataUser[0].afkfarm) { 
                clearInterval(cekafkfarm);
                clearInterval(intval2);
                msg.reply('*Berhasil menonaktifkan afkFarm*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan afkFarm*') });
            }
        }, 2000);
    } catch(e) {
        console.log(e);
    }
}

module.exports = {
    joinServer
}