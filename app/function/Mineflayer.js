const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

async function getInventory(bot, msg) {

    const chat = await msg.getChat();

    let items = bot.inventory.slots.filter((item) => { return item != undefined });

    if(items.length == 0) return chat.sendMessage('Inventory kosong');

    let no = 0;
    let strMsg = '_slot_ | _name_ | _count_\n';

    console.log(strMsg);
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

    return chat.sendMessage(strMsg);
}

async function throwItem(bot, msg) {
    try {
        const chat = await msg.getChat();

        let slot = msg.body;
        slot = slot.split(' ');

        if(slot.length < 2 || slot.length > 2) return chat.sendMessage('Command anda salah kirim kembali dengan format */throw [slot]*');

        slot = slot[1]

        if(!Number.isInteger(Number(slot))) return chat.sendMessage('Masukkan nomor slot yang benar, _contoh: /throw 3_');

        let items = bot.inventory.slots.filter((item) => { return item != undefined });

        if(items.length == 0) return chat.sendMessage('Inventory kosong');

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

        return chat.sendMessage(`Berhasil membuang ${ name }`);
    } catch (err) {
        console.log('Error ketika membuang item: ' . err)

        return chat.sendMessage('Terjadi kesalahan');
    }
}

module.exports = {
    getInventory,
    throwItem
}