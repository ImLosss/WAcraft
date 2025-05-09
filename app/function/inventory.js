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

async function throwItem(bot, msg, arg) {
    try {

        let slot = arg;

        if (!/^\d+$/.test(arg) || /^0\d+$/.test(arg)) return 'Masukkan nomor slot yang benar, _contoh: /throw 3_';
        
        let items = bot.inventory.slots.filter((item) => { return item != undefined });

        if(items.length == 0) return 'Inventory kosong';
        console.log(slot);
        if(slot > (items.length - 1) || slot < 0) return 'Mohon masukkan slot yang valid!';

        const item = items[slot];
        await bot.tossStack(item);

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

        return 'Terjadi kesalahan, coba lagi';
    }
}

function equipItem(bot, msg, arg) {
    try {
        let destinations = ['hand', 'head', 'torso', 'legs', 'feet'];
        let dest = 'hand';
        let arrMsg = arg;
        console.log(arg);
        arrMsg = arrMsg.split(' ');

        let slot = arrMsg[0]
        dest = arrMsg[1] ? arrMsg[1] : dest;

        if(!destinations.includes(dest)) return `Destination kamu salah\n/equip ${ arrMsg[0] } ~${ arrMsg[1] }~\n\nDestination:\n- hand\n- head\n- torso\n- legs\n- feet`;

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
        console.error(err)

        return 'Terjadi kesalahan';
    }
}

module.exports = {
    getInventory, throwItem, equipItem
}