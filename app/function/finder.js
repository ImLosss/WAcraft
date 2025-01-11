require('module-alias/register');
const console = require('console');

async function findBlock(bot, msg, pesan) {
    const chat = await msg.getChat();
    let blockName = pesan;

    if (bot.registry.blocksByName[blockName] === undefined) {
        msg.reply('Nama block salah, cek list block disini https://mobile.websiteku.online/');
        return;
    }

    await bot.waitForChunksToLoad()

    const ids = [bot.registry.blocksByName[blockName].id]

    const blocks = bot.findBlocks({ matching: ids, maxDistance: 192, count: 1 })

    if(blocks.length == 0) return chat.sendMessage(`Tidak menemukan ${ blockName } dalam radius 192. Pindah posisi lalu coba kembali...`);

    chat.sendMessage(`Menemukan ${blocks.length} ${blockName} blocks in x:${blocks[0].x}, y:${blocks[0].y}, z:${blocks[0].z}`);
}

module.exports = {
    findBlock
}