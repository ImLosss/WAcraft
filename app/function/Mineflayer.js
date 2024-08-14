const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

function getInventory(bot, msg) {

    let items = bot.inventory.slots.filter((item) => { return item != undefined });

    if(items.length == 0) return 'Inventory kosong';

    let no = 0;
    let strMsg = '*_slot_ | _name_ | _count_*\n';

    items.forEach((item) => {
        try {
            if (item.nbt == null || item.nbt.value.display == undefined) {
                let name = item.displayName;
                strMsg += `\n${ no++ } | ${ name } | ${ item.count }`;
            } else {
                let name = item.nbt.value.display.value.Name.value;
                name = JSON.parse(name);
                if (name.extra == undefined) name = name.text;
                else if (name.extra[0].extra == undefined) name = name.extra[0].text;
                else name = name.extra[0].extra.map(item => item.text).join('');
                strMsg += `\n${ no++ } | ${ name } | ${ item.count }`;
            }
        } catch (err) {
            no++;
            console.log('Error ketika mengambil inventory: ' . err);
            console.log(item.nbt.value.display);
        }
    });

    strMsg += `\n\n_Kirim */throw [slot]* untuk buang item yang anda mau. Contoh: /throw 0_\n\n*_Note:_*\n_Selalu kirim /inventory untuk cek slot anda sebelum membuang item agar item yang anda buang tidak salah_`;

    return strMsg;
}

function throwItem(bot, msg) {
    try {

        let slot = msg.body;
        slot = slot.split(' ');

        if(slot.length < 2 || slot.length > 2) return 'Command anda salah kirim kembali dengan format */throw [slot]*';

        slot = slot[1]

        if(!Number.isInteger(Number(slot))) return 'Masukkan nomor slot yang benar, _contoh: /throw 3_';

        let items = bot.inventory.slots.filter((item) => { return item != undefined });

        if(items.length == 0) return 'Inventory kosong';
        if(slot > (items.length - 1) || slot < 0) return 'Mohon masukkan slot yang valid!';

        const item = items[slot];
        bot.tossStack(item);

        let name = '';
        try {
            if (item.nbt == null || item.nbt.value.display == undefined) {
                name = item.displayName;
            } else {
                name = item.nbt.value.display.value.Name.value;
                name = JSON.parse(name);
                if (name.extra == undefined) name = name.text;
                else if (name.extra[0].extra == undefined) name = name.extra[0].text;
                else name = name.extra[0].extra.map(item => item.text).join('');
            }
        } catch (err) {
            console.log('Error getName throw item: ' . err);
            console.log(item.nbt.value.display);
            name = 'item'
        }

        setTimeout(() => {
            msg.reply(getInventory(bot, msg));
        }, 5000);
        return `Berhasil membuang ${ name }`;
    } catch (err) {
        console.log('Error ketika membuang item: ' . err)

        return 'Terjadi kesalahan';
    }
}

async function donate(msg, config) {
    try {
        const chat = await msg.getChat();

        const name = chat.lastMessage._data.notifyName || 'User';
        const message = `Hai ${ name }! 👋

    Terima kasih telah menggunakan MinecraftBot! 🎮

    Jika kamu merasa terbantu dengan adanya Bot ini, support dengan cara share/donate. Dukunganmu akan sangat berarti untuk menjaga Bot ini tetap berjalan dan berkembang.
        
    https://sociabuzz.com/losss/tribe

Terima kasih atas perhatian dan dukunganmu! 💖`;

        if(config.donate) chat.sendMessage(message);

        let repeatInterval;
        let repeatBroadcast = 0;
        let repeatArray = config.broadcast.message;
        repeatInterval = setInterval(() => {
            const message = repeatArray[repeatBroadcast];
            chat.sendMessage(`> ⓘ _${ message }_`);

            repeatBroadcast+=1;
            if (repeatBroadcast == repeatArray.length) clearInterval(repeatInterval);
        }, 7500);

        
    } catch (err) {
        console.log(`Terjadi kesalahan saat mengirim pesan donasi :\n${ err }`);
    }
    
}


async function automsg(bot, msg, pesan, sender) {
    try {
        const chat = await msg.getChat();
        if(pesan == '/automsg off' || pesan == '/automsg of') return automsgof(msg, sender);
        pesan = pesan.split(' ');
        if(pesan.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */automsg [time_in_min]*');
        let time = pesan[1];

        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].automsg == undefined) return msg.reply('Atur pesan automsg anda terlebih dahulu dengan cara mengirim pesan dengan format */setautomsg [message]*');
        if(dataUser[0].automsg.status) return msg.reply('automsg masih aktif, kirim */automsg of* untuk menonaktifkannya');

        if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */automsg [time_in_min]*');
        let time2 = time * 60000 + 1000;
        console.log(time2);
        dataUser[0].automsg.status = true;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
        chat.sendMessage(`*Berhasil mengaktifkan automsg tiap ${ time } Menit*`);
        const intval = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            const auto = dataUser[0].automsg.message;
            if(dataUser[0].automsg.status) {
                bot.chat(auto);
                if(dataUser[0].chatPublic) chat.sendMessage('*Berhasil mengirimkan automsg*');
            } else clearInterval(intval);
        }, time2);
        let cekautomsg = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(!dataUser[0].automsg.status) { 
                clearInterval(cekautomsg);
                clearInterval(intval);
                msg.reply('*Berhasil menonaktifkan automsg*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan automsg*') });
            }
        }, 2000);
    } catch(e) {
        console.log(e);
    }
}


module.exports = {
    getInventory,
    throwItem,
    donate,
    automsg
}