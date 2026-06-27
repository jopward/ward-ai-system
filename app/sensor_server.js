const fs = require("fs");
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

const app = express();
const sensors = {};

const ownerSensors = {};
const axios = require("axios");
const path = require("path");

app.use(express.json());

app.post(
    "/create-sensor",
    async (req, res) => {  const ownerNumber =
    req.body.owner_number;


        const sensorId =
             req.body.session_id;

            ownerSensors[
    ownerNumber
] = {

    sensorId,

    ready: false,

    phone: null

};

        const client =
            new Client({

                authStrategy:
                    new LocalAuth({
                        clientId:
                            sensorId
                    }),

             puppeteer: {
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
    timeout: 120000,
   args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-features=site-per-process"
]
}

            });

        sensors[sensorId] = {

            client,
            qr: null,
            ready: false

        };
client.on(
    "qr",
    async qr => {

        const file =
            path.join(
                process.cwd(),
                "qrs",
                `${sensorId}.png`
            );

        await qrcode.toFile(file, qr);

        sensors[sensorId].qr = file;

        console.log("QR SAVED =", file);

        if (!res.headersSent) {
            res.json({
                sensor_id: sensorId,
                qr_file: file
            });
        }

    }
);
      client.on(
    "ready",
    async () => {
        ownerSensors[
    ownerNumber
].ready = true;

ownerSensors[
    ownerNumber
].phone =
    client.info.wid.user;
        sensors[sensorId].ready = true;

        console.log(
            "SENSOR READY",
            sensorId
        );

        console.log(
            "PHONE =",
            client.info.wid.user
        );try {

    await axios.post(
        "http://127.0.0.1:8001/sensor-ready",
        {

            session_id:
                sensorId,

            sensor_number:
                client.info.wid.user

        }
    );

} catch (e) {

    console.log(
        "READY API ERROR =",
        e.response?.data ||
        e.message
    );

}

    }
);
client.on(
    "message",
    async message => {

        if (
            !message.from.endsWith("@g.us")
        ) {
            return;
        }

        console.log(
            "GROUP =",
            message.from
        );

        console.log(
            "TEXT =",
            message.body
        );

        try {

            const contact =
                await message.getContact();

            console.log(
                "SENSOR =",
                client.info.wid.user
            );

            console.log(
                "CUSTOMER =",
                contact.id.user
            );

            const response =
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
                "BOT RESPONSE =",
                response.data
            );

        } catch (e) {

            console.log(
                "POST ERROR =",
                e.response?.data ||
                e.message
            );

        }

    }
);
        try {

    await client.initialize();

} catch (e) {

    console.log(
        "INITIALIZE ERROR =",
        e
    );

    if (!res.headersSent) {

        return res.status(500).json({

            error:
                e.message

        });

    }

}
        client.on(
    "auth_failure",
    msg => {

        console.log(
            "AUTH FAILURE",
            msg
        );

    }
);

client.on(
    "disconnected",
    async reason => {

        console.log(
            "SENSOR DISCONNECTED",
            reason
        );

        try {

            await axios.post(
                "http://127.0.0.1:8001/sensor-status",
                {

                    session_id:
                        sensorId,

                    status:
                        "OFFLINE"

                }
            );

        } catch (e) {

            console.log(
                "STATUS API ERROR =",
                e.response?.data ||
                e.message
            );

        }

    }
);

           }
);

app.get(
    "/sensor/:id/qr",
    (req, res) => {

        const sensor =
            sensors[
                req.params.id
            ];

        if (
            !sensor
        ) {

            return res
                .status(404)
                .json({
                    error:
                        "sensor_not_found"
                });

        }

        if (
            !sensor.qr
        ) {

            return res
                .json({
                    status:
                        "waiting"
                });

        }

        res.json({

            qr:
                sensor.qr

        });

    }
);

async function loadSavedSensors() {

    const authPath =
        ".wwebjs_auth";

    const sessions =
        fs.readdirSync(authPath)
        .filter(
            f => f.startsWith("session-sensor_")
        );

    console.log(
        "FOUND SESSIONS =",
        sessions.length
    );

    for (const folder of sessions) {

        const sensorId =
            folder.replace(
                "session-",
                ""
            );

        console.log(
            "LOADING",
            sensorId
        );

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

        sensors[sensorId] = {

            client,
            qr: null,
            ready: false

        };

        client.on(
            "ready",
            () => {

                sensors[
                    sensorId
                ].ready =
                    true;

                console.log(
                    "RESTORED",
                    sensorId,
                    client.info.wid.user
                );

            }
        );

        client.initialize();

    }

}
app.listen(
    3002,
    async () => {

        console.log(
            "SENSOR SERVER STARTED"
        );

       await loadSavedSensors();

    }
);