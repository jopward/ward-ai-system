const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp AI Ready!');
});

client.on('message', async (message) => {

    if (message.fromMe) return;

    try {

        const response = await axios.post(
            'http://127.0.0.1:8000/chat',
            {
                user_id: message.from,
                text: message.body
            }
        );

        const aiReply = response.data.ai_reply;

        await message.reply(aiReply);

    } catch (error) {

        console.log(error);

        await message.reply("AI Error");

    }

});

client.initialize();