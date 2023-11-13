const mineflayer = require('mineflayer');
const fs = require('fs');

async function joinServer(msg, sender, isAdmin, client) {
    const chat = await msg.getChat();
    if(chat.isGroup) return msg.reply('Fitur hanya bisa digunakan di private Chat');
    let message = msg.body;
    message = message.split(' ');

    if (message.length < 3) return msg.reply('Format pesan anda salah, kirim kembali dengan format */join [ip] [username]*')
    let ip = message[1];
    let username = message[2];

    const bot = mineflayer.createBot({
        host: ip, // minecraft server ip
        username: username, // username or email, switch if you want to change accounts
        auth: 'offline' // for offline mode servers, you can set this to 'offline'
        // port: 25565,                // only set if you need a port that isn't 25565
        // version: false,             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
        // password: '12345678'        // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
    })

    bot.on('message', (pesan) => {
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);
        let data = pesan.with;
        if (Array.isArray(data) && data.length > 0) {
            if(!dataUser[0].chatPublic) return;
            if(pesan.text == '') return;
            let chat2 = data[0].extra;
            const chtArr = chat2.map(item => item.text);
            const chtStr = chtArr.join('');
            if(chtStr == '') return;
            console.log(chtStr);
            setTimeout(() => {
                chat.sendMessage(chtStr);
            }, 1000);
        } else {
            if(pesan.text == '') return;
            console.log(pesan.text);
            let outputMsg = pesan.text;
            outputMsg = outputMsg.split(' ').join(' ');            
            setTimeout(() => {
                chat.sendMessage(outputMsg);
            }, 1000);
        }
    })

    bot.on('chat', (username, msg) => {
        if(username.includes('me') || msg.includes('me')) {
            console.log(`${username} ${ msg }`);
            return chat.sendMessage(`${username} ${ msg }`);
        }
        console.log(`[Discord] *${username}* ${ msg }`);
        chat.sendMessage(`[Discord] *${username}* ${ msg }`);
    })

    bot.on('spawn', () => {
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        dataUser[0].status = 'online';
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

        sendMsg(client, bot, msg, sender);
    })

    bot.on('error', (e) => {
        console.log(e.code);
        if(e.code == "ENOTFOUND") msg.reply('IP mu sepertinya salah...');
        if(e.code == "ECONNRESET") msg.reply('Coba kembali...');
        return
    })
}

function sendMsg(client, bot, msg5, sender) {
    return new Promise((resolve) => {
        const list2 = async (msg2) => {
            if(msg2.from == sender) {
                const pesan = msg2.body;
                console.log(pesan);
                if (pesan == '/dc') { 
                    bot.quit();
                    client.removeListener('message', list2);
                } else {
                    bot.chat(msg2.body);
                }
            }
        }

        client.addListener('message', list2);
        const listeners = client.listeners('message');
        console.log(listeners.length);
        if (listeners.length > 2) {
            client.removeListener('message', listeners[2]);
            console.log(listeners.length);
        }

        bot.on('end', (msg) => {
            console.log(msg);
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');

            dataUser = JSON.parse(dataUser);
            dataUser[0].status = 'offline';

            fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));

            msg5.reply('Disconnect');
            resolve('disconnect');
        });
    });
}

module.exports = {
    joinServer
}