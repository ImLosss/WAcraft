require('module-alias/register');
const qr = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const console = require('console');
const { resetDataUser } = require('utils');
const { backup } = require('controller/BackupController')

module.exports = (function() {
    return function(client) {
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
                    console.log(`QR code successfully saved as ${ qrCodeFilePath }`);
                }
                });
            });
        });
        
        client.once('ready', () => {
            console.log('Client is ready!');
            resetDataUser(client);
        });

        client.on('call', async call => {
            call.reject();
        
            if (!call.isGroup) client.sendMessage(call.from, '> ⓘ _Hey!, hanya menerima pesan chat!_');
        });
        
        // Fungsi yang akan dijalankan setiap jam
        async function intervalBackup() {
            console.log('Daily backup');
            await backup('database', 'database.zip', client);
        }
        
        setInterval(() => {
            intervalBackup();
        }, (1000 * 60 * 60) * 24);
    };
})();