require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { startBroadcast, stopBroadcast } = require('service/MineflayerService');

module.exports = (function() {
    return function(client, bot, dirUser, chat, sender, messageListener) {
        bot.once('end', async () => {
            chat.sendMessage('Disconnect');
            const numListenersMessageBeforeRemoval = client.listeners('message').length;
            console.log(`Jumlah listener message sebelum dihapus : ${ numListenersMessageBeforeRemoval }`);
            try{
                client.removeListener('message', messageListener);
                const numListenersMessageAfterRemoval = client.listeners('message').length;
                console.log(`Jumlah listener message setelah dihapus : ${  numListenersMessageAfterRemoval }`);
            } catch (e) {
                console.log(`Gagal hapus listener : ${ e }`);
            }

            let dataUser = readJSONFileSync(dirUser);
            dataUser[0].status = 'offline';
            dataUser[0].autorightclick = false;
            dataUser[0].autoleftclick = false;
            dataUser[0].afkfarm = false;
            dataUser[0].afkfish = false;
            dataUser[0].statusRepeat = false;
            if(dataUser[0].automsg != undefined) {
                dataUser[0].automsg.status = false;
            }

            writeJSONFileSync(dirUser, dataUser);
            stopBroadcast(sender);

            // if(dataUser[0].autoReconnect) {
            //     dataUser[0].reconnectTime+=1;
            //     fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
            //     msg.reply(`*Reconnect after 15 seconds... (${ dataUser[0].reconnectTime }/5)*`).catch(() => { chat.sendMessage(`*Reconnect after 15 seconds... ${ dataUser[0].reconnectTime }*`) })
            //     setTimeout(() => {
            //         joinServer(msg, sender, client);
            //     }, 15000);
            // } else {
            //     dataUser[0].chatPublic = true;
            //     chat.sendMessage('Disconnect');
            //     writeJSONFileSync(dirUser, dataUser);
            // }
        })
    };
})();