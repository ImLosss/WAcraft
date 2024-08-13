const fs = require('fs');

function findItemById(id, bot) {
    const data = bot.registry.itemsByName;
    return Object.values(data).find(item => item.id === id) || null;
}

async function afkFishOf(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].afkfish = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
}

async function reset(bot) {
  return new Promise(async (resolve, reject) => {
    const nonNullCount = bot.inventory.slots.filter(item => item !== null).length;
    const maxinv = bot.inventory.inventoryEnd - bot.inventory.inventoryStart;
    setTimeout(async () => {
      if (maxinv == nonNullCount) bot.setQuickBarSlot(1);
      else await bot.unequip("hand");
    }, 500);
    setTimeout(() => {
      if (maxinv == nonNullCount) bot.setQuickBarSlot(2);
    }, 1000);
    setTimeout(() => {
      resolve();
    }, 1250);
  })
}

module.exports = {
    findItemById, afkFishOf, reset
}