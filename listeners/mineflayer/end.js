require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');
const { stopTimeoutDc } = require('function/timeout');
const { joinServer } = require('controller/MineflayerController');
const { startBroadcast, stopBroadcast } = require('service/MineflayerService');

module.exports = (function() {
    return function(client, bot, dirUser, msg, chat, sender, messageListener) {
        bot.once('end', async () => {
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
            dataUser[0].intervalIds = {};
            dataUser[0].timeoutIds = {};
            dataUser[0].chatPublic = true;
            if(!dataUser[1]) dataUser[1] = {};
            if (dataUser[0].automsg != undefined) dataUser[0].automsg.status = false;
            if(dataUser[0].automsg != undefined) {
                dataUser[0].automsg.status = false;
            }

            stopBroadcast(sender);
            stopTimeoutDc(sender);
            
            chat.sendMessage('Disconnect');
            writeJSONFileSync(dirUser, dataUser);
        })
    };
})();