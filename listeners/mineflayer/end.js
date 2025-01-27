require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { stopTimeoutDc } = require('function/timeout');
const { joinServer } = require('controller/MineflayerController');
const { startBroadcast, stopBroadcast } = require('service/MineflayerService');
const cache = require('cache');


module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender) {
        bot.once('end', async () => {
            let messageListener =  cache.get(`messageListener${ sender }`);

            const numListenersMessageBeforeRemoval = client.listeners('message').length;
            console.log(`Jumlah listener message sebelum dihapus : ${ numListenersMessageBeforeRemoval }`);
            try{
                client.removeListener('message', messageListener);
                cache.del(`messageListener${ sender }`);
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
            if(!dataUser[1]) dataUser[1] = {};
            if (dataUser[0].automsg != undefined) dataUser[0].automsg.status = false;
            if(dataUser[0].automsg != undefined) {
                dataUser[0].automsg.status = false;
            }

            stopBroadcast(sender);
            stopTimeoutDc(sender);

            if(dataUser[0].autoReconnect) {
                dataUser[0].reconnectTime+=1;
                writeJSONFileSync(dirUser, dataUser);
                msg.reply(`*Reconnect after 15 seconds... (${ dataUser[0].reconnectTime }/5)*`).catch(() => { chat.sendMessage(`*Reconnect after 15 seconds... (${ dataUser[0].reconnectTime }/5*)`) })
                setTimeout(() => {
                    return joinServer(msg, sender, client);
                }, 15000);
            } else {
                dataUser[0].chatPublic = true;
                writeJSONFileSync(dirUser, dataUser);
                return chat.sendMessage('Disconnect');
            }
        })
    };
})();