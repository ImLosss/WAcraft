const qr = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const {Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const { joinServer } = require('./feature/mineflayer');
const { chatPublic } = require('./feature/function');


const client = new Client({
    authStrategy: new LocalAuth()
});

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
            }]
            fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
        }

        if(chat.isGroup) {
            sender = msg.author;
            for(let participant of chat.participants) {
                if(participant.id._serialized === authorId && participant.isAdmin) {
                    isAdmin = true;
                    break;
                }
            }
        }

        console.log(text);

        if (prefix.some(pre => text.startsWith(`${pre}join`))) {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
        
            if (dataUser[0].status == 'online') { 
                msg.reply('Anda sedang Online, kirim /dc untuk disconnect');
            } else joinServer(msg, sender, isAdmin, client);
        } else if (prefix.some(pre => text.startsWith(`${pre}chatpublic`))) chatPublic(msg, sender);
        
    } catch(err) {
        console.log(err)
        msg.reply('Error')
        .catch(() => {
            client.sendMessage(msg.from, 'Error');
        })
    }

});

client.initialize();