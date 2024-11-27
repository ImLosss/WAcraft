require('module-alias/register');
const console = require('console');
const path = require('path');
const { readJSONFileSync } = require('utils');
const { withErrorHandling } = require('function/function');

const sendUpdate = withErrorHandling(async (msg, client) => {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda
    let update = readJSONFileSync(`update`);

    const keys = Object.keys(update);
    const lastKey = keys[keys.length - 1];

    update = update[lastKey].details;

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        files.forEach(user => {
            const filePath = path.join(folderPath, user);
            
            // Baca file JSON
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${user}:`, err);
                    return;
                }

                // Ubah data dalam file JSON
                try {
                    const jsonData = JSON.parse(data);

                    if(jsonData[0].ip) { 
                        client.sendMessage(user, `${ update }`)
                        .then(() => {
                            msg.reply(`Success sending Message to ${ user }`);
                        })
                        .catch((e) => {
                            console.log(e);
                            msg.reply(`Error when sending Message to ${ user }`);
                        })
                    }
                } catch (parseErr) {
                    console.error(`Error when sending a Message:`, parseErr);
                }
            });
        });
    });
})

module.exports = {
    sendUpdate
}