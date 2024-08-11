const fs = require('fs');
const { findItemById, afkFishOf } = require('../app/function/fishing');

async function fishing2(bot, msg, sender) {
    const chat = await msg.getChat();
    let timer, timer2, playerCollect;

    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    if(dataUser[0].afkfish) return msg.reply('afkFish masih aktif, nonaktifkan dengan cara kirim pesan /afkfish of').catch(() => { chat.sendMessage('afkFish masih aktif, nonaktifkan dengan cara kirim pesan /afkfish of') });

    try {
        await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
    } catch (err) {
        return chat.sendMessage('Tidak menemukan pancingan di inventory')
    }
    
    chat.sendMessage('Mulai memancing');

    timer2 = setInterval(() => {
        let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
        dataUser = JSON.parse(dataUser);

        if(!dataUser[0].afkfish) {
            clearInterval(timer2);
            bot.removeListener('playerCollect', playerCollect);
            bot.activateItem();
            chat.sendMessage('Memancing dihentikan');
        }
    }, 5000);

    bot.addListener('playerCollect', playerCollect);

    startFishing()

    dataUser[0].afkfish = true;
    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    async function startFishing () {
        clearTimeout(timer);
    
        try {
            await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
        } catch (err) {
            chat.sendMessage('Tidak menemukan pancingan di inventory')
            return afkFishOf(msg, sender);
        }
      
        timer = setTimeout(() => {
            chat.sendMessage('Memancing dibatalkan karena tidak mendapat ikan dalam 40 detik');
            return afkFishOf(msg, sender);
        }, 40000);
      
        try {
            await bot.fish()
        } catch (err) {
            chat.sendMessage('Terjadi kesalahan saat Mencoba memancing');
            return afkFishOf(msg, sender);
        }
    }

    playerCollect = async (player, entity) => {
        if(entity.type == "orb") {
          startFishing()
        } else if (entity.type == "other" && entity.metadata && entity.metadata[8] && entity.metadata[8].itemId) {
          const itemId = entity.metadata[8].itemId;
          const find = findItemById(itemId);
          chat.sendMessage(`*Catch ${ find.displayName }*`)
        }
    }

}

module.exports = {
    fishing2
}