require('module-alias/register');
const console = require('console');
const { withErrorHandling } = require('function/function');
const path = require('path');

const sendMsg = withErrorHandling(async (msg, client, arg) => {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda

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

                    if(jsonData[0].status == 'online') { 
                        client.sendMessage(user, `${ arg }`)
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
    sendMsg
}