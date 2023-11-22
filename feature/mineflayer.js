const mineflayer = require('mineflayer');
const fs = require('fs');

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


    bot.on('messagestr', (msgstr) => {
        if(msgstr == "") return;
        console.log(msgstr);
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);
        if(!dataUser[0].chatPublic) return;
        chat.sendMessage(msgstr);
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
        if(e.code == "ECONNRESET") msg.reply('Disconnect, Coba kembali...');
        else msg.reply('Disconnect, Coba kembali...');
        return;
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
                } else if (pesan == '/survival') {
                    bot.setQuickBarSlot(0);
                    bot.activateItem(false);

                    bot.on('windowOpen', (items) => {
                        bot.clickWindow(11, 0, 0);
                    })
                } else {
                    bot.chat(msg2.body);
                }
            }
        }

        client.addListener('message', list2);
        const listeners = client.listeners('message');
        console.log(listeners);
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

            client.removeListener('message', list2);
            msg5.reply('Disconnect');
            resolve('disconnect');
        });
    });
}

module.exports = {
    joinServer
}