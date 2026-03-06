const mf = require("mineflayer")
const bot = mf.createBot({
  host: "play.claritynet.work",
  username: "Ned",
  version: "1.21.4",
  physicsEnabled: false

})

bot._client.on("packet", (data, meta) => {
  // console.log("Packet received:", JSON.stringify(data), "Meta:", meta);
})
bot.once("login", () => {
  console.log("Logged in as", bot.username);
  bot.chat(`/login 280112`)
  setTimeout(() => {
    console.log('sending command /server survival');
    bot.chat('/server survival')
  }, 3000);
})

bot.on("messagestr", (message) => {
  console.log("Message received:", message.toString());
})
bot.on("spawn", () => {
  console.log("Bot spawned, physics enabled");
  bot.physicsEnabled = true
})

bot.on('kicked', (reason) => console.log('[KICKED]', JSON.stringify(reason)))
bot.on('end', () => console.log('[END] Connection ended'))
bot.on('error', (err) => console.log('[ERROR]', err))
