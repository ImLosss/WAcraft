const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');


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

async function chatPublic(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */chat [on/off]*')
    if(pesan[1] == 'off' || pesan[1] == 'of') dataUser[0].chatPublic = false; 
    else if(pesan[1] == 'on') dataUser[0].chatPublic = true; 
    else return msg.reply('Format kamu salah, kirim kembali dengan format */chat [on/off]*')

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply('Pengaturan berhasil diubah');
}

async function setIp(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setIp [ip]*')
    dataUser[0].ip = pesan[1]; 

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`IP berhasil diatur ke ${ pesan[1] }`);
}

async function tellme(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let except = [];
    if(dataUser[0].except != undefined) except = dataUser[0].except;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */tellme [message]*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    let duplicate = false;
    except.forEach(item => {
        if (item == pesan) { 
            duplicate = true;
            return
        }
    });
    if(duplicate) return msg.reply(`chat *${ pesan }* telah ada dalam whitelist msg`);
    except.push(pesan);

    dataUser[0].except = except;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`Pesan ${ pesan } berhasil ditambahkan pada whitelist msg`);
}


async function setUser(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setUser [username]*')
    let username = pesan.slice(1, pesan.length);
    username = username.join(" ");
    dataUser[0].username = username; 

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`Username berhasil diatur ke ${ pesan[1] }`);
}

async function setAutoMsg(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');
    if(dataUser[0].automsg == undefined) dataUser[0].automsg = {};
    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setautomsg [message]*')
    let message = pesan.slice(1, pesan.length);
    message = message.join(" ");
    dataUser[0].automsg.message = message;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`automsg berhasil diatur ke ${ message }`);
}

async function disconnect(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].status = 'offline';

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply('Pengaturan berhasil diubah');
}

async function automsgof(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].automsg.status = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

}

async function autoRightClickOff(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].autorightclick = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

}

async function autoLeftClickOff(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].autoleftclick = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

}

async function afkFarmOf(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].afkfarm = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

}

async function afkFishOf(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].afkfish = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
}

async function delltellme(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let except = [];
    if(dataUser[0].except != undefined) except = dataUser[0].except;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */deltellme [message]*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    msg.reply(removeFromArray(except, pesan));

    dataUser[0].except = except;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
}

async function cektellme(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let except = [];
    if(dataUser[0].except != undefined) except = dataUser[0].except;
    except = except.join(', ');

    if(except.length < 1) return  msg.reply('data kosong');
    else return msg.reply(`tellme: *${ except }*`);
}

// Fungsi untuk menghapus nilai tertentu dari array
function removeFromArray(arr, value) {
    if (value == 'reset') {
        arr.splice(0, arr.length); // Hapus semua elemen dari array
        return 'Berhasil reset data';
    } else {
        const index = arr.indexOf(value);
        if (index !== -1) {
            arr.splice(index, 1);
            return `Berhasil menghapus *${value}*`;
        } else {
            return 'Data tidak ditemukan';
        }
    }
}

async function backup_database(sourceFolderPath, outputFilePath, client) {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    // const chat = await msg.getChat();

    output.on('close', () => {
        console.log('Compression completed.');
        const media = MessageMedia.fromFilePath(outputFilePath);
        // chat.sendMessage(media, { caption: 'Berhasil' });
        client.sendMessage('6282192598451@c.us', media, { caption: 'Berhasil' })
    });

    archive.on('error', (error) => {
        console.error('An error occurred:', error);
    });

    archive.pipe(output);

    async function addFilesToArchive(folderPath, parentFolderName) {
        const items = fs.readdirSync(folderPath);
        for (const item of items) {
            const itemPath = path.join(folderPath, item);
            const relativePath = path.join(parentFolderName, item);

            if (fs.statSync(itemPath).isDirectory()) {
                addFilesToArchive(itemPath, relativePath);
            } else {
                archive.append(fs.createReadStream(itemPath), { name: relativePath });
            }
        }
    }

    await addFilesToArchive(sourceFolderPath, path.basename(sourceFolderPath))
    archive.finalize();
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

async function addWhitelist(msg, client) {
    try {
        let config = fs.readFileSync(`./config.json`, 'utf-8');
        config = JSON.parse(config);

        let user = msg.body.split(' ');

        if(user.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */addWhitelist [phone_number]*\n\nExample:\n_/addWhitelist 6282192598451_');

        const check = await client.getNumberId(user[1]);

        if (check == null) return msg.reply('Nomor tersebut tidak terdaftar di Whatsapp');

        config.maintenanceWhitelist.push(check._serialized);

        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

        return msg.reply("Data berhasil ditambahkan");
    } catch (e) {
        return msg.reply('Sepertinya parameter yang kamu masukkan salah, Coba kirim kembali dengan format */addWhitelist [phone_number]*\n\nExample:\n_/addWhitelist 6282192598451_')
    }
}

async function addBlacklist(msg, client) {
    try {
        let config = fs.readFileSync(`./config.json`, 'utf-8');
        config = JSON.parse(config);

        let user = msg.body.split(' ');

        if(user.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */addBlacklist [phone_number]*\n\nExample:\n_/addBlacklist 6282192598451_');

        const check = await client.getNumberId(user[1]);

        if (check == null) return msg.reply('Nomor tersebut tidak terdaftar di Whatsapp');

        config.blacklist.push(check._serialized);

        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

        return msg.reply("Data berhasil ditambahkan");
    } catch (e) {
        return msg.reply('Sepertinya parameter yang kamu masukkan salah, Coba kirim kembali dengan format */addBlacklist [phone_number]*\n\nExample:\n_/addBlacklist 6282192598451_')
    }
}

async function delBlacklist(msg, sender, client) {
    try {
        let config = fs.readFileSync(`./config.json`, 'utf-8');
        config = JSON.parse(config);

        let user = msg.body;
        user = user.split(' ');

        let blacklist = [];
        if(config.blacklist != undefined) blacklist = config.blacklist;

        if(user.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */delblacklist [phoneNumber]*')
        user = user.slice(1, user.length);
        user = user.join(" ");

        const check = await client.getNumberId(user);

        if (check == null) return msg.reply('Nomor tersebut tidak terdaftar di Whatsapp');

        msg.reply(removeFromArray(blacklist, check._serialized));

        config.blacklist = blacklist;

        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
    } catch (err) {
        console.log(err);
        return msg.reply('Sepertinya parameter yang kamu masukkan salah, Coba kirim kembali dengan format */delBlacklist [phone_number]*\n\nExample:\n_/addBlacklist 6282192598451_')
    }
}

async function delWhitelist(msg, sender, client) {
    try {
        let config = fs.readFileSync(`./config.json`, 'utf-8');
        config = JSON.parse(config);

        let user = msg.body;
        user = user.split(' ');

        let whitelist = [];
        if(config.maintenanceWhitelist != undefined) whitelist = config.maintenanceWhitelist;

        if(user.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */delblacklist [phoneNumber]*')
        user = user.slice(1, user.length);
        user = user.join(" ");

        const check = await client.getNumberId(user);

        if (check == null) return msg.reply('Nomor tersebut tidak terdaftar di Whatsapp');

        msg.reply(removeFromArray(whitelist, check._serialized));

        config.maintenanceWhitelist = whitelist;

        fs.writeFileSync(`./config.json`, JSON.stringify(config, null, 2));
    } catch (err) {
        console.log(err);
        return msg.reply('Sepertinya parameter yang kamu masukkan salah, Coba kirim kembali dengan format */delWhitelist [phone_number]*\n\nExample:\n_/addBlacklist 6282192598451_')
    }
}

async function maintenance(msg) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    let status = msg.body.split(' ');

    if(status.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */maintenance [on/of]*');

    if(status[1] == 'off' || status[1] == 'of') config.maintenance = false;
    else if (status[1] == 'on') config.maintenance = true;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return msg.reply("Data berhasil di update");
}

module.exports = {
    chatPublic, disconnect, setIp, setUser, setAutoMsg, automsgof, tellme, delltellme, cektellme, backup_database, autoRightClickOff, autoLeftClickOff, resetDataUser, afkFarmOf, afkFishOf, removeFromArray, injectTitle, addWhitelist, addBlacklist, maintenance, delBlacklist, delWhitelist
}