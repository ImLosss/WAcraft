const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const { automsgof, afkFarmOf } = require('../../feature/function');

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
            console.log(JSON.stringify(item));
            console.log('Error ketika mengambil inventory: ' . err);
            console.log(item.nbt.value.display);
        }
    });

    strMsg += `\n\n_Kirim */throw [slot]* untuk buang item yang anda mau. Contoh: /throw 0_\n\nKirim /equip [slot] (destination) untuk menggunakan item yang ada di inventory. Contoh: /equip 0 torso\n*Destination*\n- hand\n- head\n- torso\n- legs\n- feet\n\n*_Note:_*\n_Selalu kirim /inventory untuk cek slot anda sebelum membuang item agar item yang anda buang tidak salah_`;

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

function equipItem(bot, msg) {
    try {
        let destinations = ['hand', 'head', 'torso', 'legs', 'feet'];
        let dest = 'hand';
        let arrMsg = msg.body;
        arrMsg = arrMsg.split(' ');

        if(arrMsg.length < 2 || arrMsg.length > 3) return 'Command anda salah kirim kembali dengan format\n*/equip [slot] (hand/head/torso/legs/feet)*\n\n_Contoh:_\n_/equip 0 torso_';

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

async function donate(msg, config, sender) {
    try {
        const chat = await msg.getChat();

        const name = chat.lastMessage._data.notifyName || 'User';
        const message = `Hai ${ name }! 👋

    Terima kasih telah menggunakan MinecraftBot! 🎮

    Jika kamu merasa terbantu dengan adanya Bot ini, support dengan cara share/donate. Dukunganmu akan sangat berarti untuk menjaga Bot ini tetap berjalan dan berkembang.
        
    https://sociabuzz.com/losss/tribe

Terima kasih atas perhatian dan dukunganmu! 💖`;

        if(config.donate) chat.sendMessage(message);
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

async function findBlock(bot, msg, pesan) {
    const chat = await msg.getChat();
    pesan = pesan.split(' ');
    if(pesan.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */find [blockName]*');
    let blockName = pesan[1];

    if (bot.registry.blocksByName[blockName] === undefined) {
        msg.reply('Nama block salah, cek list block disini https://mobile.websiteku.help/');
        return;
    }

    await bot.waitForChunksToLoad()

    const ids = [bot.registry.blocksByName[blockName].id]

    const blocks = bot.findBlocks({ matching: ids, maxDistance: 192, count: 1 })

    if(blocks.length == 0) return chat.sendMessage(`Tidak menemukan ${ blockName } dalam radius 192. Pindah posisi lalu coba kembali...`);

    chat.sendMessage(`Menemukan ${blocks.length} ${blockName} blocks in x:${blocks[0].x}, y:${blocks[0].y}, z:${blocks[0].z}`);
}

async function listener(bot, msg) {
    const chat = await msg.getChat();
    bot.on('health', () => {
        let health = bot.health;
        health = Math.round(health);

        if(health <= 5) chat.sendMessage(`> ⚠️ _Darah kamu sisa ${ health }_`);
    })

    bot.on('death', () => {
        chat.sendMessage('> ⚠️ _You Die_');
    })
}

async function archer(bot, msg, pesan, sender) {
    let timer;
    const chat = await msg.getChat();
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    if(pesan == "/afkarcher of") return archerOf(bot, msg, sender);

    if(dataUser[0].afkArcher) return chat.sendMessage('afkArcher masih aktif, nonaktifkan dengan mengirim pesan /afkArcher of');

    pesan = pesan.split(' ');
    if(pesan.length > 2) return msg.reply('Format anda salah, kirim kembali dengan format /afkArcher [on/of]');
    else if(pesan[1] == "of" || pesan[1] == "off") return archerOf(bot, msg, sender);
    else if(pesan[1] != "on") return msg.reply('Format anda salah, kirim kembali dengan format /afkArcher [on/of]');

    try {
        await bot.equip(bot.registry.itemsByName.arrow.id, 'hand')
        await bot.equip(bot.registry.itemsByName.bow.id, 'hand')
    } catch (err) {
        return chat.sendMessage('tidak menemukan Bow/Arrow di inventory')
    }

    dataUser[0].afkArcher = true;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    chat.sendMessage('AfkArcher berhasil diaktifkan');

    timer = setInterval(() => {
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(!dataUser[0].afkArcher) clearInterval(timer);
        bot.activateItem();
        setTimeout(async () => {
            try {
                await bot.equip(bot.registry.itemsByName.bow.id, 'hand')
            } catch (err) {
                chat.sendMessage('Tidak menemukan Bow/Arrow di Inventory');
                return archerOf(bot, msg, sender)
            }
            const entity = bot.nearestEntity(entity => {
                if (!entity.type) return;
                const type = entity.type;
                return type === 'hostile' || type === 'animal';
            });

            if(entity) {
                const position = entity.position.offset(0, 1, 0);
                await bot.lookAt(position);
                bot.deactivateItem();
            }
        }, 1000);
    }, 2000);
}

async function archerOf(bot, msg, sender) {
    const chat = await msg.getChat();

    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].afkArcher = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    chat.sendMessage('Afk Archer berhasil dimatikan');
}

async function afkfarm(bot, msg, pesan, sender) {
    try {
        const chat = await msg.getChat();
        let click = "right";

        if(pesan == '/afkfarm of' || pesan == '/afkfarm off') {
            afkFarmOf(msg, sender);
            return;
        };
        pesan = pesan.split(' ');
        if(pesan.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */afkfarm [time_in_sec] (right/left)*');
        let time = pesan[1];

        if(pesan.length == 3 && pesan[3] == "left") click = "left";

        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(dataUser[0].afkfarm) return msg.reply('afkfarm masih aktif, kirim */afkfarm of* untuk menonaktifkannya');

        if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */afkfarm [time_in_sec] (right/left)*');
        let time2 = time * 1000;
        console.log(time2);
        dataUser[0].afkfarm = true;
        fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
        chat.sendMessage(`*Berhasil mengaktifkan afkFarm tiap ${ time } Detik, dengan ${click} Click*`);
        const intval2 = setInterval(async () => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(dataUser[0].afkfarm) {
                const blockToActivate = bot.blockAt(bot.entity.position.offset(-3, 1, 0));
                if(click == "right") bot.dig(blockToActivate);
                else bot.activateBlock(blockToActivate);
            } else clearInterval(intval2);
        }, time2);

        let cekafkfarm = setInterval(() => {
            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);
            if(!dataUser[0].afkfarm) { 
                clearInterval(cekafkfarm);
                clearInterval(intval2);
                msg.reply('*Berhasil menonaktifkan afkFarm*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan afkFarm*') });
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
    automsg,
    findBlock,
    listener,
    archer,
    afkfarm,
    equipItem
}