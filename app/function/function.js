require('module-alias/register');
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');
const console = require('console');
const { readJSONFileSync } = require('utils');

function cutVal(value, index) {
    const words = value.split(' '); // Pisahkan kalimat menjadi array kata-kata
    return words.slice(index).join(' '); // Gabungkan kembali kata-kata dari indeks yang ditentukan
}

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
    let dataClient = readJSONFileSync(`./database/client.json`);
    let dataUser = readJSONFileSync(dir);

    let str = `╓──▷「 Menu Command 」`
    for(const key in dataClient) {
        if(key == "information") {
            const data = dataClient[key];
            for(const key in data) {
                str+=`\n║ ${ key }: ${ data[key] }`
            }

            if(dataUser[0]?.ip) {
                const ip = dataUser[0].ip;
                str += `\n╟────「 Information 」`;
                str += `\n║ Server: ${ip}`;
                str += `\n║ Version: ${ dataUser[1][ip].version ? dataUser[1][ip].version : 'None'}`;
                str += `\n║ Username: ${dataUser[0].username ? dataUser[0].username : 'None'}`;
                str += `\n║ Status: ${dataUser[0].status}`;
            }
        } else if(Array.isArray(dataClient[key])) {
            str+= `\n╟────「 ${ key } 」`
            dataClient[key].forEach(item => {
                if (item.status) str+= `\n║ ▹${ item.name }`;
                else str+= `\n║ ▹ ~${ item.name }~`;
            });
        } else {
            str+= `\n╟────「 ${ key } 」`;
            const data = dataClient[key];
            for(const key in data) {
                str+=`\n║ ▹ ${ data[key] }`
            }
        }
    }
    str+= `\n╙───────────────▷`

    return str;
}

const withErrorHandling = (fn) => {
    return async (...args) => {
        try {
            await fn(...args);
        } catch (err) {
            console.error(err);
            const [msg] = args; // Mengambil msg dari args
            
            msg.reply(`Terjadi kesalahan`);
        }
    };
};

module.exports = {
    getTime, cutVal, removeFromArray, getMenu, withErrorHandling
}