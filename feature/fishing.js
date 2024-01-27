const fs = require('fs');

exports.fishing = async function(bot, msg, sender) {
    const chat = await msg.getChat();
    let status = false;
    let timer;

    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    if(dataUser[0].afkfish) return msg.reply('afkfish masih aktif, kirim */afkfish of* untuk menonaktifkannya');
    dataUser[0].afkfish = true;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));

    msg.reply('*afk fish berhasil diaktifkan*');
    
    fishing();

    const Lsound = async (soundName, position, volume, pitch) => {
        // console.log('Sound heard:', soundName, 'at', position, 'with volume', volume, 'and pitch', pitch);
        if (soundName == 459) {
            clearTimeout(timer);

            let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
            dataUser = JSON.parse(dataUser);

            status = false;
            if (dataUser[0].chatPublic) chat.sendMessage('catch fish');
            setTimeout(bot.activateItem, 500);
            setTimeout(() => {
                if(dataUser[0].afkfish) fishing();
                else {
                    bot.removeListener('hardcodedSoundEffectHeard', Lsound);
                    chat.sendMessage('*afkfish berhasil dimatikan*');
                }
            }, 4000);
        }
    }
    bot.addListener('hardcodedSoundEffectHeard', Lsound);

    async function fishing() {
        status = true;
        const blockToActivate = bot.blockAt(bot.entity.position.offset(0, 0, 3));
        equipRod();
        bot.activateItem();
        const time = setInterval(() => {
            if (status){
                bot.activateBlock(blockToActivate)
            } else {
                clearInterval(time);
            }
        }, 500);
        timer = setTimeout(() => {
            clearInterval(time);
            fishing();
        }, 20000);
    }

    async function equipRod() {
        let rod = bot.inventory.findInventoryItem(891);
                
        if (rod) {
            bot.equip(rod, 'hand');
        } else {
            chat.sendMessage('Anda tidak mempunyai pancingan')
        }
    }
}