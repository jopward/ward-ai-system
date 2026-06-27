const axios =
require("axios");
const { Client, LocalAuth } =
require("whatsapp-web.js");


const qrcode =
require("qrcode");

const sensors = {};

async function createSensor(
    sensorId
) {
    if (sensors[sensorId]) {

    console.log(
        "SENSOR EXISTS",
        sensorId
    );

    return false;

}

    const client =
        new Client({

            authStrategy:
                new LocalAuth({
                    clientId:
                        sensorId
                }),

            puppeteer: {
                headless: true,
                executablePath:
                    "/usr/bin/chromium-browser",
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            }

        });

    sensors[sensorId] =
        {
            client,
            qr: null,
            ready: false
        };

    client.on(
        "qr",
        async qr => {

            sensors[
                sensorId
            ].qr =
                await qrcode.toDataURL(
                    qr
                );

            console.log(
                "QR GENERATED",
                sensorId
            );

        }
    );
client.on(
    "ready",
    async () => {

        try {

            sensors[sensorId].ready = true;

            console.log(
                "SENSOR READY",
                sensorId
            );

            const chats =
                await client.getChats();

            console.log(
                "GROUP COUNT =",
                chats.filter(c => c.isGroup).length
            );

        } catch (e) {

            console.log(
                "READY ERROR =",
                e
            );

        }

    }
);

client.on(
    "message",
    async message => {

        if (
            !message.from.endsWith(
                "@g.us"
            )
        ) {
            return;
        }

        try {

            const contact =
                await message.getContact();

            await axios.post(
                "http://127.0.0.1:3001/incoming-message",
                {
                    user_id:
                        contact.id.user,

                    sensor_number:
                        client.info.wid.user,

                    customer_number:
                        contact.id.user,

                    text:
                        message.body,

                    group_id:
                        message.from,

                    message_id:
                        message.id._serialized
                }
            );

            console.log(
                "DYNAMIC SENSOR SENT",
                contact.id.user
            );

        } catch (e) {

            console.log(
                "DYNAMIC SENSOR ERROR",
                e.message
            );

        }

    }
);
  }

function getSensor(
    sensorId
) {

    return sensors[
        sensorId
    ];

}

module.exports = {

    createSensor,
    getSensor

};