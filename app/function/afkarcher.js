require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');

async function archer(bot, msg, pesan, sender) {
    let timer;
    const chat = await msg.getChat();
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    if(pesan == "of") return archerOf(bot, msg, sender);

    if(dataUser[0].afkArcher) return chat.sendMessage('afkArcher masih aktif, nonaktifkan dengan mengirim pesan /afkArcher of');

    pesan = pesan.split(' ');
    if(pesan.length > 1) return msg.reply('Format anda salah, kirim kembali dengan format /afkArcher <on/of>');
    else if(pesan == "of" || pesan == "off") return archerOf(bot, msg, sender);
    else if(pesan != "on") return msg.reply('Format anda salah, kirim kembali dengan format /afkArcher <on/of>');

    try {
        await bot.equip(bot.registry.itemsByName.arrow.id, 'hand')
        await bot.equip(bot.registry.itemsByName.bow.id, 'hand')
    } catch (err) {
        return chat.sendMessage('tidak menemukan Bow/Arrow di inventory')
    }

    dataUser[0].afkArcher = true;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    chat.sendMessage('AfkArcher berhasil diaktifkan');

    timer = setInterval(async () => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)

        if(!dataUser[0].afkArcher) clearInterval(timer);
        try {
            await bot.equip(bot.registry.itemsByName.arrow.id, 'hand')
            await bot.equip(bot.registry.itemsByName.bow.id, 'hand')
        } catch (err) {
            chat.sendMessage('Tidak menemukan Bow/Arrow di Inventory');
            clearInterval(timer);
            return archerOf(bot, msg, sender)
        }
        bot.activateItem();
        setTimeout(async () => {
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

    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)

    dataUser[0].afkArcher = false;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    chat.sendMessage('Afk Archer berhasil dimatikan');
}

module.exports = {
    archer
}