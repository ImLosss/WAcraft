const mineflayer = require('mineflayer');
const fs = require('fs');
const { autoRightClickOff } = require('./function');

let Lmessagestr, Lspawn, Lerror;

async function joinServer(msg, sender, isAdmin, client) {
    const chat = await msg.getChat();
    if(chat.isGroup) return msg.reply('Fitur hanya bisa digunakan di private Chat');
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    if(dataUser[0].ip == undefined) return msg.reply('silahkan atur IP anda terlebih dahulu, dengan format */setip [ip]*');
    if(dataUser[0].username == undefined) return msg.reply('silahkan atur username anda terlebih dahulu, dengan format */setuser [username]*');

    const bot = mineflayer.createBot({
        host: dataUser[0].ip, 
        username: dataUser[0].username, 
        auth: 'offline'   
    })


    Lmessagestr = async (msgstr) => {
        if(msgstr == "") return;
        // console.log(msgstr);
        let except = [];
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);
        if(dataUser[0].except != undefined) except = dataUser[0].except;
        if(except.some(pre => msgstr.includes(pre))) return chat.sendMessage(msgstr);
        if(!dataUser[0].chatPublic) return;
        chat.sendMessage(msgstr);
    }

    Lspawn = async () => {
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].status == 'offline') {
            sendMsg(client, bot, msg, sender, chat);
            dataUser[0].status = 'online';
            fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));
        }
    }

    Lerror = async (e) => {
        console.log(`Lerror: ${ e }`);
        if(e.code == "ENOTFOUND") msg.reply('IP mu sepertinya salah...').catch(( )=> { chat.sendMessage('IP mu sepertinya salah...') });
        if(e.code == "ECONNRESET") msg.reply('Disconnect, Coba kembali...').catch(() => { chat.sendMessage('Disconnect, Coba kembali') });
        else msg.reply('Disconnect, Coba kembali...').catch(() => { chat.sendMessage('Disconnect, Coba kembali') });
        return;
    }

    bot.addListener('messagestr', Lmessagestr);
    bot.addListener('spawn', Lspawn);
    bot.addListener('error', Lerror);
}

function sendMsg(client, bot, msg5, sender, chat) {
    return new Promise((resolve) => {
        const list2 = async (msg2) => {
            if(msg2.from == sender) {
                const pesan = msg2.body;
                console.log(pesan);
                if (pesan == '/dc') { 
                    bot.quit();
                } else if (pesan == '/survival') {
                    bot.setQuickBarSlot(0);
                    bot.activateItem(false);
                    const window = async (items) => {
                        bot.clickWindow(11, 0, 0);
                        bot.removeListener('windowOpen', window);
                    }
                    bot.addListener('windowOpen', window);
                } else if (pesan.startsWith('/automsg')) {
                    automsg(bot, msg5, pesan, sender);
                } else if(pesan == '/playerlist') {
                    playerOnline(bot, msg5);
                } else if(pesan.startsWith('/autorightclick')) {
                    autoRightClick(bot, msg5, pesan, sender);
                } else {
                    bot.chat(msg2.body);
                }
            }
        }
        client.addListener('message', list2);

        bot.on('kicked', (msg) => {
            msg = JSON.parse(msg);
            console.log(`Kicked : ${ msg.text }`);
            msg5.reply(`Kicked : ${ msg.text }`).catch(() => { chat.sendMessage(`Kicked : ${ msg.text }`) });
        })
        bot.on('end', (msg) => {
            console.log(`End: ${ msg }`);
            client.removeListener('message', list2);
            bot.removeListener('messagestr', Lmessagestr);
            bot.removeListener('spawn', Lspawn);
            bot.removeListener('error', Lerror);

            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            dataUser[0].status = 'offline';
            dataUser[0].chatPublic = true;
            if(dataUser[0].automsg != undefined) {
                dataUser[0].automsg.status = false;
            }

            fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

            msg5.reply('Disconnect').catch(() => { chat.sendMessage('Disconnect') });
            resolve('disconnect');
        });
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

        if(dataUser[0].automsg.status) return msg.reply('automsg masih aktif, kirim */automsg of* untuk menonaktifkannya');
        if(dataUser[0].automsg == undefined) return msg.reply('Atur pesan auto msg anda terlebih dahulu dengan cara mengirim pesan dengan format */setautomsg [message]*');

        if(isNaN(time)) return msg.reply('Format anda salah kirim kembali dengan format */automsg [time_in_min]*');
        let time2 = time * 60000 + 1000;
        console.log(time2);
        dataUser[0].automsg.status = true;
        const auto = dataUser[0].automsg.message;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));
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
                console.log('menonaktifkan automsg');
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
        player = player.join(', ');

        return msg.reply(`*Players Online:*\n\n${ player }`).catch(() => { chat.sendMessage(`*Players Online:*\n\n${ player }`) });
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

        if(isNaN(time)) return msg.reply('Format anda salah kirim kembali dengan format */autorightclick [time_in_sec]*');
        let time2 = time * 1000;
        console.log(time2);
        dataUser[0].autorightclick = true;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));
        chat.sendMessage(`*Berhasil mengaktifkan autorightclick tiap ${ time } Detik*`);
        const intval2 = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(dataUser[0].autorightclick) {
                bot.activateItem(false);
            } else clearInterval(intval2);
        }, time2);
    } catch(e) {
        console.log(e);
    }
}

module.exports = {
    joinServer
}