function findItemById(id) {
    const data = bot.registry.itemsByName;
    return Object.values(data).find(item => item.id === id) || null;
}

async function afkFishOf(msg, sender) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].afkfish = false;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser, null, 2));
}

module.exports = {
    findItemById, afkFishOf
}