const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');


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
                    jsonData[0].afkfarm = false;
                    jsonData[0].afkfish = false;
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

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */chatPublic [on/off]*')
    if(pesan[1] == 'off' || pesan[1] == 'of') dataUser[0].chatPublic = false; 
    else if(pesan[1] == 'on') dataUser[0].chatPublic = true; 
    else return msg.reply('Format kamu salah, kirim kembali dengan format */chatPublic [on/off]*')

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

    except.forEach(item => {
        if (item == pesan) return msg.reply(`chat *${ pesan }* telah ada dalam whitelist msg`);
    });
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
    dataUser[0].username = pesan[1]; 

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

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */delltellme [message]*')
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
    const index = arr.indexOf(value);
    if (index !== -1) {
        arr.splice(index, 1);
        return `Berhasil menghapus *${ value }*`;
    } else {
        return 'Data tidak ditemukan';
    }
}

async function backup_database(sourceFolderPath, outputFilePath, msg) {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chat = await msg.getChat();

    output.on('close', () => {
        console.log('Compression completed.');
        const media = MessageMedia.fromFilePath(outputFilePath);
        chat.sendMessage(media, { caption: 'Berhasil' });
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

module.exports = {
    chatPublic, disconnect, setIp, setUser, setAutoMsg, automsgof, tellme, delltellme, cektellme, backup_database, autoRightClickOff, resetDataUser, afkFarmOf, afkFishOf, removeFromArray
}