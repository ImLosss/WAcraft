require('module-alias/register');
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');

function cutVal(value, index) {
    const words = value.split(' '); // Pisahkan kalimat menjadi array kata-kata
    return words.slice(index).join(' '); // Gabungkan kembali kata-kata dari indeks yang ditentukan
}

function removeFromArray(arr, value) {
    try {
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
    } catch (err) {
        console.error(err);
        return 'Terjadi Kesalahan';
    }
}

function getTime() {
    // Tentukan zona waktu Makassar
    const time = moment().tz('Asia/Makassar');

    // Ambil tanggal, jam, dan menit
    const tanggal = time.format('YYYY-MM-DD');
    const jam = time.format('HH');
    const menit = time.format('mm');

    return `${ tanggal } / ${ jam }:${ menit }`;
}

function getMenu(dir) {
    try {
        let dataClient = readJSONFileSync(`./database/client.json`);
        let dataUser = readJSONFileSync(dir);

        let str = `╓──▷「 *Menu Command* 」`
        for(const key in dataClient) {
            if(key == "information") {
                const data = dataClient[key];
                for(const key in data) {
                    str+=`\n║ ${ key }: ${ data[key] }`
                }

                if(dataUser[0]?.ip) {
                    const ip = dataUser[0].ip;
                    if(!dataUser[1][ip]) dataUser[1][ip] = {};
                    str += `\n╟────「 *Information* 」`;
                    str += `\n║ Server: ${ip}`;
                    str += `\n║ Version: ${ dataUser[1][ip].version ? dataUser[1][ip].version : 'None'}`;
                    str += `\n║ Username: ${dataUser[0].username ? dataUser[0].username : 'None'}`;
                    str += `\n║ Status: ${dataUser[0].status}`;
                }
            } else if(Array.isArray(dataClient[key])) {
                str+= `\n╟────「 *${ key }* 」`
                dataClient[key].forEach(item => {
                    if (item.status) str+= `\n║ ▹${ item.name }`;
                    else str+= `\n║ ▹ ~${ item.name }~`;
                });
            } else {
                str+= `\n╟────「 *${ key }* 」`;
                const data = dataClient[key];
                for(const key in data) {
                    str+=`\n║ ▹ ${ data[key] }`
                }
            }
        }
        str+= `\n╙───────────────▷`

        return str;
    } catch (err) {
        return `Terjadi kesalahan: ${ err.message }`;
    }
}

const checkCommandStatus = (command) => {
    let commandsData = readJSONFileSync(`./database/client.json`);

    // Mencari command yang namanya mengandung kata kunci dari 'command'
    let cmd = commandsData["List Command"].find(c => c.name.toLowerCase().includes(command.toLowerCase()));
    let cmd2 = commandsData["Command InGame"].find(c => c.name.toLowerCase().includes(command.toLowerCase()));

    if (cmd) {
        return cmd.status;
    }

    if (cmd2) {
        return cmd2.status;
    }

    return true;
};

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
        return msg.reply('Sepertinya parameter yang kamu masukkan salah, Coba kirim kembali dengan format */delBlacklist [phone_number]*\n\nExample:\n_/delBlacklist 6282192598451_')
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
        return msg.reply('Sepertinya parameter yang kamu masukkan salah, Coba kirim kembali dengan format */delWhitelist [phone_number]*\n\nExample:\n_/delBlacklist 6282192598451_')
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

async function update(msg) {
    const chat = await msg.getChat();
    const folderPath = 'database/data_user'; // Ganti dengan path menuju folder Anda
    let update = fs.readFileSync(`update`, 'utf-8');
    update = JSON.parse(update);
    
    const keys = Object.keys(update);
    const lastKey = keys[keys.length - 1];

    update = update[lastKey].details;

    msg.reply(update).catch(() => { chat.sendMessage(update) })
}

async function bugReport(msg, client, sender) {
    const chat = await msg.getChat();
    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('Format kamu salah, kirim kembali dengan format */bugReport <describe_bug>*');
    pesan = pesan.slice(1, pesan.length);
    pesan = pesan.join(" ");

    client.sendMessage('6282192598451@c.us', pesan)
    .then(() => {
        msg.reply('The report has been succesfully sent, Thank you!').catch(() => { chat.sendMessage('The report has been succesfully sent, Thank you!') })
    }).catch((e) => {
        console.log(e);
        msg.reply('Terjadi kesalahan, coba kembali...').catch(() => { chat.sendMessage('Terjadi kesalahan, coba kembali...')});
    })
}

const withErrorHandling = (fn, defaultMsg, bot, defaultChat) => {
    return async (...args) => {
        try {
            await fn(...args);
        } catch (err) {
            console.error(err);

            // Cek apakah `msg` ada di args
            const msgFromArgs = args.find(arg => arg && typeof arg.reply === 'function');
            const chatFromArgs = args.find(arg => arg && typeof arg.sendMessage === 'function');
            const chat = chatFromArgs || defaultChat;
            const msg = msgFromArgs || defaultMsg; // Gunakan msg dari args atau defaultMsg

            if(bot) bot.quit();

            try {
                if(chat) chat.sendMessage(`Terjadi kesalahan: ${err.message}`);
                else if (msg) chat.sendMessage(`Terjadi kesalahan: ${err.message}`);
                else console.error(err);
            } catch (err) { console.error(err); }
        }
    };
};

module.exports = {
    getTime, cutVal, 
    removeFromArray, getMenu, 
    withErrorHandling, addBlacklist, 
    addWhitelist, delBlacklist, 
    delWhitelist, maintenance, 
    update, checkCommandStatus,
    bugReport
}