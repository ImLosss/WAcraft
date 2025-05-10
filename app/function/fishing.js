require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function')
const { findItemById } = require('service/MineflayerService')

async function fishing(bot, msg, sender, arg) {
    if (arg == "of" || arg == "off") return afkFishOf(msg, sender);
    const chat = await msg.getChat();
    let timer, timer2, playerCollect, dataUser;

    dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    if(dataUser[0].afkfish) return msg.reply('afkFish masih aktif, nonaktifkan dengan cara kirim pesan /afkfish of').catch(() => { chat.sendMessage('afkFish masih aktif, nonaktifkan dengan cara kirim pesan /afkfish of') });

    try {
        await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
    } catch (err) {
        return chat.sendMessage('*Tidak menemukan pancingan di inventory*')
    }
    
    chat.sendMessage('*Mulai memancing*');

    timer2 = setInterval(() => {
        dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

        if(!dataUser[0].afkfish) {
            clearInterval(timer2);
            clearTimeout(timer);
            bot.removeListener('playerCollect', playerCollect);
            reset(bot);
            chat.sendMessage('*Memancing dihentikan*');
        }
    }, 3000);

    dataUser[0].afkfish = true;
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

    startFishing()

    async function startFishing () {
        clearTimeout(timer);

        if(!dataUser[0].afkfish) return
    
        try {
            await reset(bot);
            await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
        } catch (err) {
            chat.sendMessage('*Tidak menemukan pancingan di inventory*')
            return afkFishOf(msg, sender);
        }
      
        timer = setTimeout(() => {
            chat.sendMessage('*Tidak mendapat apapun dalam 1 menit, memancing kembali...*');
            return startFishing();
        }, 60000);
      
        try {
            await bot.fish()
        } catch (err) {
            console.log(err.message);
        }
    }

    playerCollect = async (player, entity) => {
        if(entity.type == "orb") {
            startFishing()
        } else if (entity.type == "other" && entity.metadata && entity.metadata[8] && entity.metadata[8].itemId) {
            let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);
            const itemId = entity.metadata[8].itemId;
            const find = findItemById(itemId, bot);
            if(dataUser[0].chatPublic) chat.sendMessage(`*Catch ${ find.displayName }*`)
        }
    }
    bot.addListener('playerCollect', playerCollect);
}

async function reset(bot) {
    return new Promise(async (resolve, reject) => {
        const nonNullCount = bot.inventory.slots.filter(item => item !== null).length;
        const maxinv = bot.inventory.inventoryEnd - bot.inventory.inventoryStart;
        setTimeout(async () => {
            // if (maxinv == nonNullCount) bot.setQuickBarSlot(1);
            // else await bot.unequip("hand");
            bot.setQuickBarSlot(1);
        }, 500);
        setTimeout(() => {
            if (maxinv == nonNullCount) bot.setQuickBarSlot(2);
        }, 1000);
        setTimeout(() => {
            resolve();
        }, 1250);
    })
}

async function afkFishOf(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`);

    dataUser[0].afkfish = false;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
}

module.exports = {
    fishing
}