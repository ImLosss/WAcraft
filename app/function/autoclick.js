require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('utils');
const { removeFromArray } = require('function/function')

async function autoRightClick(bot, msg, arg, sender) {
    const chat = await msg.getChat();
    if(arg == 'of' || arg == 'off') {
        autoRightClickOff(msg, sender);
        return;
    };

    if(arg.split(' ').length < 1) return msg.reply('Format anda salah kirim kembali dengan format */autorightclick <time_in_sec>*');
    let time = arg;

    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)

    if(dataUser[0].autorightclick) return msg.reply('autorightclick masih aktif, kirim */autorightclick of* untuk menonaktifkannya');

    if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */autorightclick <time_in_sec>*');
    let time2 = time * 1000;
    dataUser[0].autorightclick = true;
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
    chat.sendMessage(`*Berhasil mengaktifkan autorightclick tiap ${ time } Detik*`);
    const intval2 = setInterval(() => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)
        if(dataUser[0].autorightclick) {
            bot.activateItem();
        } else clearInterval(intval2);
    }, time2);

    let cekautorightclick = setInterval(() => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)
        if(!dataUser[0].autorightclick) { 
            clearInterval(cekautorightclick);
            clearInterval(intval2);
            msg.reply('*Berhasil menonaktifkan autoRightClick*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan autoRightClick*') });
        }
    }, 2000);
}

async function autoLeftClick(bot, msg, arg, sender) {
    const chat = await msg.getChat();
    if(arg == 'of' || arg == 'off') {
        autoLeftClickOff(msg, sender);
        return;
    };

    if(arg.split(' ').length < 1) return msg.reply('Format anda salah kirim kembali dengan format */autoleftclick <time_in_sec>*');
    let time = arg;

    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)

    if(dataUser[0].autoleftclick) return msg.reply('autoleftclick masih aktif, kirim */autoleftclick of* untuk menonaktifkannya');

    if(isNaN(time) || time == 0) return msg.reply('Format anda salah kirim kembali dengan format */autoleftclick <time_in_sec>*');
    let time2 = time * 1000;
    dataUser[0].autoleftclick = true;
    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);
    chat.sendMessage(`*Berhasil mengaktifkan autoleftclick tiap ${ time } Detik*`);
    const intval2 = setInterval(async () => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)
        if(dataUser[0].autoleftclick) {
            // const entity = bot.entityAtCursor(5);
            // if (entity && entity.kind != "UNKNOWN" && entity.kind != undefined)  {
            //     bot.attack(entity);
            // }
            // else bot.swingArm();

            const entity = bot.nearestEntity(entity => {
                if (!entity.type) return;
                const type = entity.type;
                return type === 'hostile' || type === 'animal' || type === 'mob';
            });

            if(entity) {
                const position = entity.position.offset(0, 0.5, 0);
                await bot.lookAt(position)
                bot.attack(entity);
            }
        } else clearInterval(intval2);
    }, time2);

    let cekautoleftclick = setInterval(() => {
        let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)
        if(!dataUser[0].autoleftclick) { 
            clearInterval(cekautoleftclick);
            clearInterval(intval2);
            msg.reply('*Berhasil menonaktifkan autoLeftClick*').catch(() => { chat.sendMessage('*Berhasil menonaktifkan autoLeftClick*') });
        }
    }, 2000);
}

async function autoRightClickOff(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)

    dataUser[0].autorightclick = false;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

}

async function autoLeftClickOff(msg, sender) {
    let dataUser = readJSONFileSync(`./database/data_user/${ sender }`)

    dataUser[0].autoleftclick = false;

    writeJSONFileSync(`./database/data_user/${ sender }`, dataUser);

}

module.exports = {
    autoRightClick, autoLeftClick
}