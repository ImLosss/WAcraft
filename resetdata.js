const fs = require('fs');
const path = require('path');

resetDataUser();

async function resetDataUser() {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            
            // Baca file JSON
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return;
                }

                // Ubah data dalam file JSON
                try {
                    const jsonData = JSON.parse(data);

                    jsonData[0].status = 'offline'; 
                    jsonData[0].chatPublic = true;
                    jsonData[0].autorightclick = false;
                    jsonData[0].autoleftclick = false;
                    jsonData[0].afkfarm = false;
                    jsonData[0].afkfish = false;
                    jsonData[0].statusRepeat = false;
                    jsonData[0].reconnectTime = 0;
                    if(!jsonData[1]) jsonData[1] = {};
                    if (jsonData[0].automsg != undefined) jsonData[0].automsg.status = false;

                    // Tulis kembali file JSON yang telah diubah
                    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
                } catch (parseErr) {
                    console.error(`Error parsing JSON in file ${file}:`, parseErr);
                }
            });
        });
    });
}