const fs = require('fs');
const { removeFromArray } = require('./function');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const archiver = require('archiver');

exports.setAutoReconnect = async function setAutoReconnect(msg, sender) { 
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2 || (pesan[1] != 'of' && pesan[1] != 'on' && pesan[1] != 'off')) return msg.reply('Format kamu salah, kirim kembali dengan format */autoReconnect [on/off]*')
    if(pesan[1] == 'on') dataUser[0].autoReconnect = true; 
    else if(pesan[1] == 'of' || pesan[1] == 'off') dataUser[0].autoReconnect = false; 

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`autoreconnect diatur ke ${ pesan[1] }`);
}

exports.autocmd = async function autocmd(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */autocmd [message]*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    let duplicate = false;
    autocmd.forEach(item => {
        if (item == pesan) { 
            duplicate = true;
            return;
        }
    });
    if (duplicate) return msg.reply(`cmd *${ pesan }* telah ada dalam list cmd`);
    autocmd.push(pesan);

    dataUser[0].autocmd = autocmd;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`Pesan *${ pesan }* berhasil ditambahkan pada autocmd`);
}

exports.cekautocmd = async function cekautocmd(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;
    autocmd = autocmd.join(', ');

    if(autocmd.length < 1) return  msg.reply('data kosong');
    else return msg.reply(`autocmd: *${ autocmd }*`);
}

exports.setRealUser = async function setRealUser(msg, sender) {
    let dataUser = getDataUser(sender);
    const ip = dataUser[0].ip;

    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */setRealUser [username]*')
    let username = pesan.slice(1, pesan.length);
    username = username.join(" ");

    if(!dataUser[1][ip]) dataUser[1][ip] = {};
    dataUser[1][ip].realUser = username;

    let listAlt = [];
    if(dataUser[1][ip].alt) listAlt = dataUser[1][ip].alt;
    removeFromArray(listAlt, pesan);
    dataUser[1][ip].alt = listAlt;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    return msg.reply(`Real username berhasil diatur ke *${ username }*`);
}

exports.cekAlt = async function cekAlt(sender) {
    let dataUser = getDataUser(sender);
    const user = dataUser[0].username;
    const ip = dataUser[0].ip;
    let listAlt = [];
    if(dataUser[1][ip].alt) listAlt = dataUser[1][ip].alt;

    const index = listAlt.indexOf(user);
    if (index !== -1) {
        // data ditemukan
    } else {
        if(user != dataUser[1][ip].realUser) { 
            listAlt.push(user);
            dataUser[1][ip].alt = listAlt;
            fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
        }
    }
}

exports.cekInfo = async function cekInfo(msg, sender) {
    const chat = await msg.getChat();
    let dataUser = getDataUser(sender);

    jsonData = dataUser[1];

    if (Object.keys(jsonData).length === 0) return msg.reply('Data kosong');

    const dataArray = Object.entries(jsonData).map(([key, value]) => ({
        ip: key,
        realUser: value.realUser,
        alt: value.alt
    }));

    let send = "*Info Akun & List Alt*\n\n"
    let no = 1;
    dataArray.map(item => {
        let listAlt = item.alt;
        if(listAlt.length > 0) listAlt = listAlt.join(', ');
        else listAlt = "None";

        send+=`ip: ${ item.ip }\nrealUser: ${ item.realUser }\nalt: ${ listAlt }\n`;
        if(dataArray.length != no) {
        send+='-----------------------------------------\n'
        no+=1;
        }
    })

    return msg.reply(send).catch(() => { chat.sendMessage(send) });
}

exports.delautocmd = async function delautocmd(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    let pesan = msg.body;
    pesan = pesan.split(' ');

    let autocmd = [];
    if(dataUser[0].autocmd != undefined) autocmd = dataUser[0].autocmd;

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */delautocmd [message]*')
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    msg.reply(removeFromArray(autocmd, pesan));

    dataUser[0].autocmd = autocmd;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
}

exports.getDataUser = function getDataUser(sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);
    return dataUser;
}

exports.getTime = function getTime() {
    // Buat objek Date
    const date = new Date();

    // Atur zona waktu ke WITA (GMT+8)
    date.setUTCHours(date.getUTCHours() + 8);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Ingat bahwa indeks bulan dimulai dari 0 (Januari = 0)
    const day = date.getDate();
    const dayOfWeekIndex = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    formattedTime = {
        day: days[dayOfWeekIndex],
        date: day,
        month: month,
        year: year,
        hours:hours,
        minutes: minutes,
        seconds: seconds
    }

    return `${ formattedTime.day } / ${ formattedTime.date }-${ formattedTime.month }-${ formattedTime.year } / ${ formattedTime.hours }.${ formattedTime.minutes }`;

}

exports.getTime = function getTime() {
    // Buat objek Date
    const date = new Date();

    // Atur zona waktu ke WITA (GMT+8)
    date.setUTCHours(date.getUTCHours() + 8);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Ingat bahwa indeks bulan dimulai dari 0 (Januari = 0)
    const day = date.getDate();
    const dayOfWeekIndex = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    formattedTime = {
        day: days[dayOfWeekIndex],
        date: day,
        month: month,
        year: year,
        hours:hours,
        minutes: minutes,
        seconds: seconds
    }

    return `${ formattedTime.day } / ${ formattedTime.date }-${ formattedTime.month }-${ formattedTime.year } / ${ formattedTime.hours }.${ formattedTime.minutes }`;

}

exports.sendMsg = async function sendMsg(msg, client) {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda
    
    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */sendmsg [message]*');
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

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
                        client.sendMessage(user, `${ pesan }`)
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
}

exports.sendUpdate = async function sendUpdate(msg, client) {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda
    let update = fs.readFileSync(`update`, 'utf-8');
    update = JSON.parse(update);
    update = update["1.2.5"].details;

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
}

exports.sendMsgAll = async function sendMsgAll(msg, client) {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda
    
    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */sendmsg [message]*');
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

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
                        client.sendMessage(user, `${ pesan }`)
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
}

exports.bugReport = async function bugReport(msg, client, sender) {
    const chat = await msg.getChat();
    try {
        let pesan = msg.body;
        pesan = pesan.split(' ');

        if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */bugReport [describe_bug]*');
        pesan = pesan.slice(1, pesan.length);
        pesan = pesan.join(" ");

        client.sendMessage('6282192598451@c.us', pesan)
        .then(() => {
            msg.reply('The report has been succesfully sent, Thank you!').catch(() => { chat.sendMessage('The report has been succesfully sent, Thank you!') })
        }).catch((e) => {
            console.log(e);
            msg.reply('Terjadi kesalahan, coba kembali...').catch(() => { chat.sendMessage('Terjadi kesalahan, coba kembali...')});
        })
    } catch (e) {
        console.log(e);
        msg.reply('Error, coba kembali...').catch(() => { chat.sendMessage('Error, coba kembali...') });
    }
}

exports.getInfoUser = async function getInfoUser(msg, client) {
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda
    
    let username = msg.body;
    username = username.split(' ');

    if(username.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */getInfoUser [username]*');
    username = username.slice(1, username.length);
    username = username.join(" ");

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        files.forEach(async (user) => {
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

                    if(!jsonData[1]) return
                    if (Object.keys(jsonData).length === 0) return console.log('data Kosong');

                    dataUser = jsonData[1];

                    const dataArray = Object.entries(dataUser).map(([key, value]) => ({
                        ip: key,
                        realUser: value.realUser,
                        alt: value.alt
                    }));
                    
                    let output = dataArray.filter((item) => {
                        const foundAlt = item.alt.find((listAlt) => listAlt == username);
                        return foundAlt;
                    })

                    let send = `WA: ${ user }\n`;
                    output.map((item) => {
                        altStr = item.alt.join(', ');
                        send+=`ip: ${ item.ip }\nrealUser: ${ item.realUser }\nalt: ${ altStr }\n`;
                    })
                    if (send != `WA: ${ user }\n`) return msg.reply(send);
                } catch (parseErr) {
                    msg.reply(`Error when sending a Message:`, parseErr);
                }
            });
        });
    });
}

exports.backupInterval = async function backupInterval(sourceFolderPath, outputFilePath, client) {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log('Compression completed.');
        const media = MessageMedia.fromFilePath(outputFilePath);
        client.sendMessage("6282192598451@c.us", media, { caption: 'Daily Backup' });
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

function getDataUser(sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);
    return dataUser;
}