require('module-alias/register');
const console = require('console');
const mineflayer = require('mineflayer');
const { withErrorHandling } = require('function/function');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const { cekAlt, injectTitle, listener, cekMember } = require('service/MineflayerService');
const { mapDownloader } = require('mineflayer-item-map-downloader');

const joinServer = withErrorHandling(async (msg, sender, client) => {
    const chat = await msg.getChat();
    const dirUser = `./database/data_user/${ sender }`

    if(chat.isGroup) return chat.sendMessage('Fitur hanya bisa digunakan di private Chat');

    let dataUser = readJSONFileSync(dirUser);
    let config = readJSONFileSync(`./config.json`);

    if(config.joinGroup) {
        const result = await cekMember(client, sender);
        if(!result) return chat.sendMessage('Join Group Minebot untuk mulai bermain\n\nhttps://chat.whatsapp.com/GXnhvcQfz0e7Vg327JHW8B', { linkPreview: true });
    }

    if(dataUser[0].status == 'online') return chat.sendMessage('Anda sedang Online, kirim /dc untuk disconnect');
    if(dataUser[0].ip == undefined) return chat.sendMessage('silahkan atur IP anda terlebih dahulu, dengan format */setip <ip>*');
    if(dataUser[0].username == undefined) return chat.sendMessage('silahkan atur username anda terlebih dahulu, dengan format */setuser <username>*');
    if(dataUser[0].reconnectTime >= 5) {
        dataUser[0].reconnectTime = 0;
        writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
        return chat.sendMessage('Gagal join ke server...');
    }

    const ip = dataUser[0].ip;
    if(!dataUser[1][ip]) return chat.sendMessage(`Sebelum join ke server, Anda *diwajibkan* untuk mengatur username asli yang anda mainkan(bukan akun alt/afk) di server ${ dataUser[0].ip } terlebih dahulu.\nKirim pesan dengan format:\n*/setRealUser <username_asli>*\n\n_Hal ini diperlukan karena semua user yg join menggunakan bot ini akan memiliki ip yg sama, untuk melihat info akun anda kirim */info*_.`, { linkPreview: false });
    if(!dataUser[1][ip].version) return chat.sendMessage(`Atur versi minecraft yang ingin kamu mainkan di server ${ dataUser[0].ip }. Kirim */setver <version>* untuk mengatur versi.\nContoh: /setver 1.20\n\nList Version:\n${ config.versions.join(', ') }`, { linkPreview: false })
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

    injectTitle(bot);
    require('import/mineflayer')(client, bot, dirUser, msg, chat, sender, config)
})

module.exports = {
    joinServer
}