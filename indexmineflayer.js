const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'play.claritynetwork.net', // minecraft server ip
  username: 'Ned', // username or email, switch if you want to change accounts
  auth: 'offline' // for offline mode servers, you can set this to 'offline'
  // port: 25565,                // only set if you need a port that isn't 25565
  // version: false,             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // password: '12345678'        // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})

bot.on('spawn', () => {
    setTimeout(() => {
        bot.chat('/login 040103');
        setTimeout(() => {
            bot.chat('/survival');
        }, 10000);
    }, 10000);
})

bot.on('message', (message) => {
    let data = message.with;
    if (Array.isArray(data) && data.length > 0) {
        let chat = data[0].extra;
        const chtArr = chat.map(item => item.text);
        const chtStr = chtArr.join('');
        if(chtStr == '') return;
        console.log(chtStr);
    } else {
        if(message.text == '') return;
        if(message.text == '[+] Losss') bot.chat('/home sf');
        console.log(message.text);
    }
}) 
// Log errors and kick reasons:
bot.on('kicked', (message) => {
    console.log(message);
    console.log(han);
})
bot.on('error', (message) => {
    console.log(message);
    console.log(han);
})