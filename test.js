const mineflayer = require('mineflayer');
const { ProxyAgent } = require('proxy-agent'); // Correctly import ProxyAgent
const { exec } = require('child_process');
const axios = require('axios'); // Tambahkan axios untuk memeriksa IP publik

const SERVER_HOST = 'blastsmp.xyz'; // Ganti dengan IP/host server kamu
const SERVER_PORT = 25565;
const TOTAL_BOTS = 3; // Jumlah bot yang ingin dijalankan

async function getPublicIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Gagal mendapatkan IP publik:', error.message);
    return 'Tidak diketahui';
  }
}

function createBot(index) {
  const username = `lossess_${index}_${Math.floor(Math.random() * 1000)}`;
  const agent = new ProxyAgent('socks5://127.0.0.1:9050'); // Use 'new' to create an instance

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    username,
    auth: 'offline',
    version: '1.20',
    agent,
  });

  bot.on('login', async () => {
    const publicIP = await getPublicIP();
    console.log(`[${username}] Login sukses! IP publik: ${publicIP}`);
  });

  bot.on('end', () => {
    console.log(`[${username}] Disconnected.`);
  });

  bot.on('error', (err) => {
    console.error(`[${username}] Error:`, err.message);
  });

  bot.on('kicked', (msg) => {
    console.log(`[${username}] kicked:`, msg);
  });
}

// Ganti IP Tor (meminta identitas baru)
function rotateTorIP() {
  return new Promise((resolve, reject) => {
    exec('kill -HUP $(pidof tor)', (err, stdout, stderr) => {
      if (err) {
        console.error('Gagal ganti IP Tor:', err.message);
        reject(err);
      } else {
        console.log('IP Tor diganti.');
        setTimeout(resolve, 5000); // Tunggu 5 detik agar IP baru aktif
      }
    });
  });
}

async function startBots() {
  for (let i = 0; i < TOTAL_BOTS; i++) {
    createBot(i);
    await rotateTorIP(); // Ganti IP tiap bot
    await new Promise((r) => setTimeout(r, 2000)); // Delay antar bot
  }
}

startBots();
