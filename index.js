const qr = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const {Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const { joinServer } = require('./feature/mineflayer');
const fungsi = require('./feature/fungsi');
const { chatPublic, disconnect, setIp, setUser, setAutoMsg, automsgof, tellme, delltellme, cektellme, backup_database, resetDataUser } = require('./feature/function');

resetDataUser();

const client = new Client({
    authStrategy: new LocalAuth()
});

const menu = `╓──▷「 *Menu Command* 」
║ Author : Losss
║ Bot_desc : AFK bot for your farm
╟────「 *List Command* 」
║ ▹/menu
║ ▹/setip [ip_server]
║ ▹/setuser [username_mc]
║ ▹/join
║ ▹/autoReconnect [on/of]
║ ▹/autocmd [msg]
║ ▹/delAutocmd [msg]
║ ▹/cekAutocmd [msg]
║ ▹/bugReport [describe_bug]
╟───「 *Command inGame* 」
║ ▹/automsg [time_in_min]
║ ▹/autoRightClick [time_in_sec]
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

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();

        const prefix = ['!', '/', '.'];

        chat.sendSeen();
        client.sendPresenceAvailable();

        const text = msg.body.toLowerCase() || '';

        chat.sendSeen;

        const authorId = msg.author;
        let isAdmin = false;
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

        if(chat.isGroup) {
            for(let participant of chat.participants) {
                if(participant.id._serialized === authorId && participant.isAdmin) {
                    isAdmin = true;
                    break;
                }
            }
        }

        if (prefix.some(pre => text.startsWith(`${pre}join`))) {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
        
            if (dataUser[0].status == 'online') { 
                msg.reply('Anda sedang Online, kirim /dc untuk disconnect');
            } else joinServer(msg, sender, isAdmin, client);
        } else if (prefix.some(pre => text.startsWith(`${pre}chatpublic`) || text.startsWith(`${pre}chat`))) chatPublic(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}dc`))) disconnect(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}setip`))) setIp(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}setuser`))) setUser(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}setautomsg`))) setAutoMsg(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}automsg of`))) automsgof(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}tellme`))) tellme(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}deltellme`))) delltellme(msg, sender);
        else if (prefix.some(pre => text == `${pre}cektellme`)) cektellme(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}autocmd`))) fungsi.autocmd(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}delautocmd`))) fungsi.delautocmd(msg, sender);
        else if (prefix.some(pre => text == `${pre}cekautocmd`)) fungsi.cekautocmd(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}autoreconnect`))) fungsi.setAutoReconnect(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}setrealuser`))) fungsi.setRealUser(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}setrealuser`))) fungsi.cekInfo(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}bugreport`))) fungsi.bugReport(msg, client, sender);
        else if (prefix.some(pre => text == `${pre}menu`)) msg.reply(menu);
        else if (prefix.some(pre => text === `${pre}backup`) && sender == "6282192598451@c.us") await backup_database('database', 'database.zip', msg);
        else if (prefix.some(pre => text.startsWith(`${pre}sendmsg`)) && sender == "6282192598451@c.us") fungsi.sendMsg(msg, client);
        else if (prefix.some(pre => text === `${pre}sendupdate`) && sender == "6282192598451@c.us") fungsi.sendUpdate(msg, client);
        
    } catch(err) {
        console.log(err)
        msg.reply('Error')
        .catch(() => {
            client.sendMessage(msg.from, 'Error');
        })
    }

});

client.initialize();