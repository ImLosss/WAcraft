const path = require('path');
const fs = require('fs');
const lockfile = require('proper-lockfile');

function getLocation() {
    const error = new Error();
    const stack = error.stack.split('\n');

    const projectRoot = getProjectRoot(__dirname);

    // Mulai dari elemen ke-2 untuk melewati baris pertama yang merupakan lokasi Error dibuat
    for (let i = 3; i < stack.length; i++) {
        const callerLine = stack[i];
        const filePathMatch = callerLine.match(/\((.*):\d+:\d+\)/) || callerLine.match(/at (.*):\d+:\d+/);
        
        if (filePathMatch) {
            const fullPath = filePathMatch[0];
            if (fullPath && fullPath.includes(projectRoot) && !fullPath.includes('node:internal/modules') && !fullPath.includes('service/utils.js') && !fullPath.includes('service/utils.js')) {
                
                // console.log(fullPath);
                let fileName = path.basename(fullPath); 
                fileName = fileName.replace(/[()]/g, '');

                return fileName;
            }
        }
    }
    return null;
}

function getLocationError() {
    const error = new Error();
    const stack = error.stack.split('\n');

    const projectRoot = getProjectRoot(__dirname);

    // Mulai dari elemen ke-2 untuk melewati baris pertama yang merupakan lokasi Error dibuat
    for (let i = 3; i < stack.length; i++) {
        const callerLine = stack[i];
        const filePathMatch = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);

        if (filePathMatch) {
            const fullPath = filePathMatch[0];
            if (fullPath && fullPath.includes(projectRoot) && !fullPath.includes('node:internal/modules') && !fullPath.includes('service/utils.js') && !fullPath.includes('service/utils.js')) {
                
                // console.log(fullPath);
                let fileName = path.basename(fullPath); 
                fileName = fileName.replace(/[()]/g, '');

                return fileName;
            }
        }
    }
    return null;
}

function injectTitle (bot) {
    bot._client.on('title', (packet) => {
        if (packet.action === 0 || packet.action === 1) {
            bot.emit('title', packet.text)
        }
    })
  
    bot._client.on('set_title_text', (packet) => {
        bot.emit('title', packet.text)
    })
    bot._client.on('set_title_subtitle', (packet) => {
        setTimeout(() => {
            bot.emit('subtitle', packet.text)
        }, 100);
    })
}

function getProjectRoot(dir) {

    while (dir !== path.parse(dir).root) {
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return path.basename(dir);
        }
        dir = path.dirname(dir);
    }

    return 'not found';
}

function deleteFile(dir) {
    fs.unlink(dir, err => {
        if (err) {
            return;
        }
    });
}

function readJSONFileSync(filePath) {
    let release;
    try {
        // Lock the file for reading
        release = lockfile.lockSync(filePath);
        
        let fileContent = fs.readFileSync(filePath, 'utf-8');

        if(fileContent == '') fileContent = [];
        else fileContent = JSON.parse(fileContent);

        return fileContent;
    } catch (error) {
        return [];
    } finally {
        if (release) {
            release();
        }
    }
}

function writeJSONFileSync(filePath, data) {
    let release;
    try {
        try {
            release = lockfile.lockSync(filePath);
        } catch(err) {}
        
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf-8');
    } catch (error) {
        console.error('Error writing file:', error);
    } finally {
        if (release) {
            release();
        }
    }
}

async function resetDataUser(client) {
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

                    if(jsonData[0].status == 'online') client.sendMessage(file, '_*Bot restarted*_');

                    jsonData[0].status = 'offline'; 
                    jsonData[0].chatPublic = true;
                    jsonData[0].autorightclick = false;
                    jsonData[0].autoleftclick = false;
                    jsonData[0].afkfarm = false;
                    jsonData[0].afkfish = false;
                    jsonData[0].statusRepeat = false;
                    jsonData[0].reconnectTime = 0;
                    jsonData[0].intervalIds = {};
                    jsonData[0].timeoutIds = {};
                    if(!jsonData[1]) jsonData[1] = {};
                    if (jsonData[0].automsg != undefined) jsonData[0].automsg.status = false;

                    // Tulis kembali file JSON yang telah diubah
                    writeJSONFileSync(filePath, jsonData);
                } catch (parseErr) {
                    if (file == "DON'T DELETE THIS") return;
                    console.error(`Error parsing JSON in file ${file}:`, parseErr);
                }
            });
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            clearInterval(intervalId);
            resolve();
        }, ms);
    });
}



module.exports = {
    getLocation, getLocationError, injectTitle, deleteFile, writeJSONFileSync, readJSONFileSync, resetDataUser, sleep
};