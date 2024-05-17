const qr = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const {Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const { joinServer } = require('./feature/mineflayer');
const fungsi = require('./feature/fungsi');
const { chatPublic, disconnect, setIp, setUser, setAutoMsg, automsgof, tellme, delltellme, cektellme, backup_database, resetDataUser, addWhitelist, addBlacklist, maintenance, delBlacklist, delWhitelist } = require('./feature/function');


const client = new Client({
    authStrategy: new LocalAuth(), // your authstrategy here
    puppeteer: {
        args: ['--no-sandbox']
    }
});

const menu = `╓──▷「 *Menu Command* 」
║ Author : Losss
║ Bot_desc : AFK bot for your farm
╟────「 *List Command* 」
║ ▹/menu
║ ▹/setip [ip_server]
║ ▹/setuser [username_mc]
║ ▹/setRealUser [real_username]
║ ▹/info
║ ▹/join
║ ▹/autoReconnect [on/of]
║ ▹/autocmd [msg]
║ ▹/delAutocmd [msg]
║ ▹/cekAutocmd [msg]
║ ▹/update
║ ▹/bugReport [describe_bug]
╟───「 *Command inGame* 」
║ ▹/automsg [time_in_min]
║ ▹/autoRightClick [time_in_sec]
║ ▹/autoLeftClick [time_in_sec]
║ ▹/inventory
║ ▹/chat [on/off]
║ ▹/playerlist
║ ▹/tellme [msg]
║ ▹/cekTellme
║ ▹/delTellme [msg]
║ ▹/ping
║ ▹/dc
╟─────「 *example* 」
║ ▹/chat off
║ ▹/automsg 1
║ ▹/setip play.claritynetwork.net
║ ▹/tellme Only 10 more votes
║ ▹/playerlist
╟─────「 *Note* 」
║ ▹ tanda [ ] pada command *wajib* di
║   isi
║ ▹ tanda ( ) pada command bisa
║   diabaikan
║ ▹ Harap gunakan perintah dengan 
║   bijak
╙───────────────▷`

const prefixFunctionsAdmin = {
    'backup': (msg, sender, client, arg) => backup_database('database', 'database.zip', client),
    'sendmsg': (msg, sender, client, arg) => fungsi.sendMsg(msg, client),
    'sendupdate': (msg, sender, client, arg) => fungsi.sendUpdate(msg, client),
    'sendmsgall': (msg, sender, client, arg) => fungsi.sendMsgAll(msg, client),
    'addwhitelist': (msg, sender, client, arg) => addWhitelist(msg, client),
    'addblacklist': (msg, sender, client, arg) => addBlacklist(msg, client),
    'maintenance': (msg, sender, client, arg) => maintenance(msg),
    'delblacklist': (msg, sender, client, arg) => delBlacklist(msg, sender, client),
    'delwhitelist': (msg, sender, client, arg) => delWhitelist(msg, sender, client),
}

const prefixFunctions = {
    'update': (msg, sender, client, arg) => fungsi.update(msg),
    'join': (msg, sender, client, arg) => joinServer(msg, sender, client),
    'dc': (msg, sender, client, arg) => disconnect(msg, sender),
    'cektellme': (msg, sender, client, arg) => cektellme(msg, sender),
    'cekautocmd': (msg, sender, client, arg) => fungsi.cekautocmd(msg, sender),
    'chat': (msg, sender, client, arg) => chatPublic(msg, sender),
    'setip': (msg, sender, client, arg) => setIp(msg, sender),
    'setuser': (msg, sender, client, arg) => setUser(msg, sender),
    'setautomsg': (msg, sender, client, arg) => setAutoMsg(msg, sender),
    'tellme': (msg, sender, client, arg) => tellme(msg, sender),
    'deltellme': (msg, sender, client, arg) => delltellme(msg, sender),
    'autocmd': (msg, sender, client, arg) => fungsi.autocmd(msg, sender),
    'delautocmd': (msg, sender, client, arg) => fungsi.delautocmd(msg, sender),
    'autoreconnect': (msg, sender, client, arg) => fungsi.setAutoReconnect(msg, sender),
    'setrealuser': (msg, sender, client, arg) => fungsi.setRealUser(msg, sender),
    'info': (msg, sender, client, arg) => fungsi.cekInfo(msg, sender),
    'bugreport': (msg, sender, client, arg) => fungsi.bugReport(msg, client, sender),
    'getinfouser': (msg, sender, client, arg) => fungsi.getInfoUser(msg, client),
};

client.on('qr', qrdata => {
    qrcode.generate(qrdata, {
        small: true
    })
    // Generate QR code as a data URI
    qr.toDataURL(qrdata, (err, url) => {
        if (err) {
            console.error('Failed to generate QR code:', err);
            return;
        }
    
        // Save QR code data URI as an image file
        const qrCodeFilePath = 'qrcode.png';
        const dataUri = url.split(',')[1];
        const buffer = Buffer.from(dataUri, 'base64');
        
        fs.writeFile(qrCodeFilePath, buffer, (err) => {
        if (err) {
            console.error('Failed to save QR code as an image:', err);
        } else {
            console.log('QR code successfully saved as', qrCodeFilePath);
        }
        });
    });
});

client.once('ready', () => {
    console.log('Client is ready!');
    resetDataUser(client);
});

client.on('message', async msg => {
    try {
        let config = fs.readFileSync(`./config.json`, 'utf-8');
        config = JSON.parse(config);

        const chat = await msg.getChat();

        const prefix = ['/', '!'];

        chat.sendSeen();
        client.sendPresenceAvailable();

        const text = msg.body.toLowerCase() || '';

        let sender = msg.from;

        const dir_data_user = `./database/data_user/${ sender }`
        if(!fs.existsSync(dir_data_user)) {
            let data_user = [{
                chatPublic: true,
                chatPrivate: true,
                status: "offline"
            }]
            fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
        }

        if (prefix.some(pre => text == `${pre}menu`)) return msg.reply(menu);
        else if(!chat.isGroup) {
            for (const pre of prefix) {
                if (text.startsWith(`${pre}`)) {
                    const funcName = text.replace(pre, '').trim().split(' ');

                    if(prefixFunctions[funcName[0]] && config.blacklist.includes(sender)) return chat.sendMessage("Maaf nomor anda telah di blacklist. Anda tidak dapat menggunakan bot ini lagi");
                    
                    if(config.maintenance) {
                        const whitelist = config.maintenanceWhitelist;
                        if(prefixFunctions[funcName[0]] && !whitelist.includes(sender)) {
                            return msg.reply('Bot sedang melakukan pengujian fitur, Anda tidak termasuk dalam whitelist!');
                        }
                    }

                    if (prefixFunctions[funcName[0]]) {
                        return prefixFunctions[funcName[0]](msg, sender, client, text);
                    } else if (prefixFunctionsAdmin[funcName[0]] && sender == config.owner) {
                        return prefixFunctionsAdmin[funcName[0]](msg, sender, client, text);
                    }
                }
            }
        }
    } catch(err) {
        console.log(err)
        msg.reply('Error')
        .catch(() => {
            client.sendMessage(msg.from, 'Error');
        })
    }

});
// Fungsi yang akan dijalankan setiap jam
async function intervalBackup() {
    console.log('Daily backup');
    await backup_database('database', 'database.zip', client);
}

setInterval(() => {
    intervalBackup();
}, (1000 * 60 * 60) * 24);

client.initialize();