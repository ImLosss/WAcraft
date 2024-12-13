require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function')

function getInventory(bot) {

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
            console.error('Error ketika mengambil inventory: ' . err);
            console.error(JSON.stringify(item));
            console.error(item.nbt.value.display);
        }
    });

    strMsg += `\n\n_Kirim */throw <slot>* untuk buang item yang anda mau. Contoh: /throw 0_\n\nKirim */equip <slot> (destination)* untuk menggunakan item yang ada di inventory. Contoh: /equip 0 torso\n*Destination*\n- hand\n- head\n- torso\n- legs\n- feet\n\n*_Note:_*\n_Selalu kirim /inventory untuk cek slot anda sebelum membuang item agar item yang anda buang tidak salah_`;

    return strMsg;
}

function throwItem(bot, msg) {
    try {

        let slot = msg.body;
        slot = slot.split(' ');

        if(slot.length < 2 || slot.length > 2) return 'Command anda salah kirim kembali dengan format */throw <slot>*';

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
            msg.reply(getInventory(bot));
        }, 5000);
        return `Berhasil membuang ${ name }`;
    } catch (err) {
        console.log('Error ketika membuang item: ' . err)

        return 'Terjadi kesalahan';
    }
}

function equipItem(bot, msg) {
    try {
        let destinations = ['hand', 'head', 'torso', 'legs', 'feet'];
        let dest = 'hand';
        let arrMsg = msg.body;
        arrMsg = arrMsg.split(' ');

        if(arrMsg.length < 2 || arrMsg.length > 3) return 'Command anda salah kirim kembali dengan format\n*/equip <slot> (hand/head/torso/legs/feet)*\n\n_Contoh:_\n_/equip 0 torso_';

        let slot = arrMsg[1]
        dest = arrMsg[2] ? arrMsg[2] : dest;

        if(!destinations.includes(dest)) return `Destination kamu salah\n${ arrMsg[0] } ${ arrMsg[1] } ~${ arrMsg[2] }~\n\nDestination:\n- hand\n- head\n- torso\n- legs\n- feet`;

        if(!Number.isInteger(Number(slot))) return 'Masukkan nomor slot yang benar, _contoh: /equip 3 head_';

        let items = bot.inventory.slots.filter((item) => { return item != undefined });

        if(items.length == 0) return 'Inventory kosong';
        if(slot > (items.length - 1) || slot < 0) return 'Mohon masukkan slot yang valid!';

        const item = items[slot];
        bot.equip(item, dest);

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

        return `Berhasil equip ${ name } di ${ dest }`;
    } catch (err) {
        console.log('Error ketika equip item: ' . err)

        return 'Terjadi kesalahan';
    }
}

module.exports = {
    getInventory, throwItem, equipItem
}