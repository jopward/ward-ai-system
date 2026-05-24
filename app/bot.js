const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),

    puppeteer: {
        headless: false,
       
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp AI Ready!');
});

const messageBuffers = {};
const messageTimers = {};
const userBuffers = {};
client.on('message', async (message) => {

    if (message.fromMe) return;

    const userId = message.from;

    if (!userBuffers[userId]) {
        userBuffers[userId] = {
            messages: [],
            timer: null
        };
    }

    userBuffers[userId].messages.push(message.body);

    clearTimeout(userBuffers[userId].timer);

    userBuffers[userId].timer = setTimeout(async () => {

        const fullMessage =
            userBuffers[userId].messages.join(' ');

        userBuffers[userId].messages = [];

        try {

            const response = await axios.post(
                'http://127.0.0.1:8001/chat',
                {
                    user_id: userId,
                    text: fullMessage
                }
            );

            const aiReply = response.data.ai_reply;

            await message.reply(aiReply);

        } catch (error) {

            console.log(error);

            await message.reply("AI Error");

        }

    }, 2000);

});

client.initialize();