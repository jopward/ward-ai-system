const fs = require("fs");
const path = require("path");
const express = require("express");
const axios = require("axios");
const qrcode = require("qrcode");

const {
    Client,
    LocalAuth
} = require("whatsapp-web.js");

const app = express();

app.use(express.json());

const sensors = {};
const ownerSensors = {};

function createClient(sensorId) {

    const client = new Client({

        authStrategy: new LocalAuth({

            clientId: sensorId

        }),

        puppeteer: {

            headless: true,

            executablePath:
                "/usr/bin/chromium-browser",

            args: [

                "--no-sandbox",

                "--disable-setuid-sandbox",

                "--disable-dev-shm-usage",

                "--disable-gpu"

            ]

        }

    });

    sensors[sensorId] = {

        client,

        qr: null,

        ready: false

    };

    return client;

}

function registerEvents(

    client,

    sensorId,

    ownerNumber,

    res

) {

    client.on(

        "qr",

        async qr => {

            const file = path.join(

                process.cwd(),

                "qrs",

                `${sensorId}.png`

            );

            await qrcode.toFile(

                file,

                qr

            );

            sensors[sensorId].qr = file;

            console.log(

                "QR SAVED =",

                file

            );

            if (

                res &&

                !res.headersSent

            ) {

                res.json({

                    sensor_id:

                        sensorId,

                    qr_file:

                        file

                });

            }

        }

    );

    client.on(

        "ready",

        async () => {

            sensors[sensorId].ready = true;

            if (ownerSensors[ownerNumber]) {

                ownerSensors[ownerNumber].ready = true;

                ownerSensors[ownerNumber].phone =
                    client.info.wid.user;

            }

            console.log(
                "SENSOR READY =",
                sensorId
            );

            console.log(
                "PHONE =",
                client.info.wid.user
            );

            try {

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

        "disconnected",

        async reason => {

            console.log(
                "DISCONNECTED =",
                reason
            );

            sensors[sensorId].ready = false;

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

    client.on(

        "message",

        async message => {

            if (
                !message.from.endsWith("@g.us")
            ) {
                return;
            }

            try {

                const contact =
                    await message.getContact();

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

}

app.post(

    "/create-sensor",

    async (req, res) => {

        const ownerNumber =
            req.body.owner_number;

        const sensorId =
            req.body.session_id;

        if (

            ownerSensors[ownerNumber] &&

            sensors[
                ownerSensors[ownerNumber].sensorId
            ]

        ) {

            return res.json({

                sensor_id:
                    ownerSensors[
                        ownerNumber
                    ].sensorId,

                ready:
                    ownerSensors[
                        ownerNumber
                    ].ready,

                phone:
                    ownerSensors[
                        ownerNumber
                    ].phone,

                qr_file:
                    sensors[
                        ownerSensors[
                            ownerNumber
                        ].sensorId
                    ]?.qr

            });

        }

        ownerSensors[
            ownerNumber
        ] = {

            sensorId,

            ready: false,

            phone: null

        };

        const client =
            createClient(
                sensorId
            );

        registerEvents(

            client,

            sensorId,

            ownerNumber,

            res

        );

        client.on(

            "auth_failure",

            msg => {

                console.log(

                    "AUTH FAILURE =",

                    msg

                );

            }

        );

        try {

            await client.initialize();

        } catch (e) {

            console.log(

                "INITIALIZE ERROR =",

                e

            );

            if (

                !res.headersSent

            ) {

                return res.status(500).json({

                    error:
                        e.message

                });

            }

        }

    }

);

async function loadSavedSensors() {

    const authPath =
        ".wwebjs_auth";

    if (
        !fs.existsSync(authPath)
    ) {

        return;

    }

    const sessions =
        fs.readdirSync(authPath)
        .filter(
            f =>
                f.startsWith(
                    "session-sensor_"
                )
        );

    console.log(
        "FOUND SESSIONS =",
        sessions.length
    );

    for (
        const folder of sessions
    ) {

        const sensorId =
            folder.replace(
                "session-",
                ""
            );

        console.log(
            "RESTORING",
            sensorId
        );

        const client =
            createClient(
                sensorId
            );

        registerEvents(
            client,
            sensorId,
            null,
            null
        );

        try {

            await client.initialize();

        } catch (e) {

            console.log(
                "RESTORE ERROR =",
                e.message
            );

        }

    }

}

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

            return res.json({

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

app.listen(

    3002,

    async () => {

        console.log(
            "SENSOR SERVER STARTED"
        );

        await loadSavedSensors();

    }

);
