require('module-alias/register');
const qr = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const {Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const console = require('console');

const client = new Client({
    authStrategy: new LocalAuth(), // your authstrategy here
    puppeteer: {
        args: ['--no-sandbox'],
        executablePath: "/usr/bin/google-chrome"
    }
});

require('import/index')(client);

client.initialize();