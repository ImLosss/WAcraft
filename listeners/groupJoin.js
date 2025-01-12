require('module-alias/register');
const console = require('console');

module.exports = (function() {
    return function(client) {
        client.on('group_join', async (notification) => {
            const chat = await notification.getChat();

            let contacts = [];
            for (const item of notification.recipientIds) {
                let contact = await client.getContactById(item);
                contacts.push(contact);
            }
            
            if (notification.type === 'add' || notification.type === 'invite' && chat.isGroup && notification.chatId == '120363355816098681@g.us') {
                for (const item of contacts) {
                    let mentions = [item];

                    const pesan = `Hai, @${ item.id.user }! Terima kasih telah bergabung di grup *${ chat.name }*. Grup ini adalah tempat:
                    
- Diskusi seputar fitur dan penggunaan Minebot.
- Laporan Bug jika kamu menemukan masalah saat menggunakan bot.
- Announcement ketika akan melakukan maintenance, pembaruan, dan informasi lainnya.

📋 Panduan Singkat:

- Toxic sewajarnya.
- Jelaskan detail bug yang ditemukan dan jangan lupa tag admin.
- Jangan ragu untuk bertanya atau berdiskusi tentang fitur Minebot.

🚫 Dilarang:

Spam, iklan, atau topik yang tidak relevan dengan Minecraft.`;
                    chat.sendMessage(pesan, { mentions })
                }
            }
        });
    };
})();