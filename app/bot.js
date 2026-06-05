const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const OWNER_NUMBER = "90688670703663@lid";
const DRIVER_GROUP_ID =
"120363425338510691@g.us";

const client = new Client({

    authStrategy: new LocalAuth(),

    puppeteer: {

        headless: true,
        executablePath: '/usr/bin/chromium-browser',

        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-features=site-per-process'
        ]

    }

});

client.on('qr', (qr) => {

    qrcode.generate(qr, {
        small: true
    });

});

client.on('ready', () => {

    console.log('✅ WhatsApp AI Ready!');

});

const userBuffers = {};

const wifeIds = [

    "962785021861",
    "159683327295736"


];

//"90688670703663"

client.on('message', async (message) => {

    try {

        // تجاهل رسائل البوت نفسه
        if (message.fromMe) return;


        // فحص هل الرسالة من جروب
        const isGroup = message.from.includes("@g.us");

        // تجاهل الرسائل الفاضية
        if (!message.body || message.body.trim() === "") {
            return;
        }

        const userId = message.from;

        // أوامر المالك
        if (
            message.from === OWNER_NUMBER &&
            message.body.startsWith("#system")
        ) {

            const prompt = message.body
                .replace("#system", "")
                .trim();

            try {

                await axios.post(
                    "http://127.0.0.1:8001/system-prompt",
                    {
                        content: prompt
                    }
                );

                await message.reply(
                    "✅ تم تحديث البرومبت"
                );

            } catch (error) {

                console.log(error);

                await message.reply(
                    "❌ فشل تحديث البرومبت"
                );

            }

            return;
        }





        // فحص هل الرسالة من جروب


        if (isGroup) {


            // السائق رد على رسالة
           

            console.log(
                "GROUP ID =",
                message.from
            );

            console.log(
                "GROUP MESSAGE =",
                message.body
            );

            console.log(
                "MESSAGE ID =",
                message.id._serialized
            );

            try {

                const contact =
    await message.getContact();

console.log(
    "GROUP CONTACT =",
    contact
);

                const response =
                    await axios.post(
                        "http://127.0.0.1:8001/ride-test",
                        {
                            user_id:
                                contact.id.user + "@c.us",

                            text:
                                message.body,

                            is_wife:
                                false,

                            group_id:
                                message.from,

                            message_id:
                                message.id._serialized
                        }
                    );

                console.log(
                    "RIDE RESULT =",
                    response.data
                );
                if (
                    response.data.status ===
                   "driver_post"
                ) {

                   console.log(
                  "DRIVER POST DETECTED"
    );

    return;
}
                if (
    response.data.status ===
    "saved"
) {

    const drivers =
        await axios.post(
            "http://127.0.0.1:8001/find-drivers",
            {
                pickup:
                    response.data.pickup,

                destination:
                    response.data.destination
            }
        );

    console.log(
        "MATCHING DRIVERS =",
        drivers.data
    );

    for (
        const driver
        of drivers.data
    ) {

        try {

            await client.sendMessage(
                driver,

`🚖 طلب #${response.data.ride_id}

من:
${response.data.pickup}

إلى:
${response.data.destination}

للحجز اكتب:

#take ${response.data.ride_id}`
            );

        } catch (e) {

            console.log(
                "SEND DRIVER ERROR",
                e.message
            );

        }

    }

   setTimeout(
    async () => {

        try {

            const check =
                await axios.post(
                    "http://127.0.0.1:8001/check-ride",
                    {
                        ride_id:
                            response.data.ride_id
                    }
                );
                const ride =
                    check.data;

            console.log(
                "RIDE CHECK =",
                check.data
            );

            if (
                check.data.status ===
                "NEW"
            ) {

               await client.sendMessage(
    DRIVER_GROUP_ID,

`🚖 رحلة جديدة

من:
${ride.pickup}

إلى:
${ride.destination}

للحجز اكتب:

#take ${response.data.ride_id}`
);

console.log(
    "PUBLISHED TO DRIVER GROUP"
);
await client.sendMessage(
    ride.customer_number,
    "⏳ ما زلنا نبحث عن سائق مناسب لرحلتك"
);

            }

        } catch (e) {

            console.log(
                "CHECK ERROR",
                e.message
            );

        }

    },
    300000
);

}

            } catch (error) {

                console.log(
                    "RIDE ERROR =",
                    error.response?.data ||
                    error.message
                );

            }

            return;


        }
        if (
    message.body === "#myrides"
) {

    try {

        const response =
            await axios.post(
                "http://127.0.0.1:8001/my-rides",
                {
                    driver_number:
                        userId
                }
            );

        let text =
            "🚖 رحلاتك:\n\n";

        response.data.forEach(
            ride => {

                text +=
`#${ride.id}
${ride.pickup}
⬇
${ride.destination}

الحالة:
${ride.status}

`;
            }
        );

        await client.sendMessage(
            userId,
            text
        );

    } catch (e) {

        await client.sendMessage(
            userId,
            "❌ خطأ"
        );

    }

    return;
}
const confirmWords = [
    "نعم",
    "اه",
    "أه",
    "ايوه",
    "yes",
    "ok",
    "موافق"
];
const rejectWords = [
    "لا",
    "لأ",
    "no",
    "رفض"
];


if (
    rejectWords.includes(
        message.body.trim().toLowerCase()
    )
) {

    const contact =
        await message.getContact();

    const realNumber =
        contact.id._serialized;

    try {

        const response =
            await axios.post(
                "http://127.0.0.1:8001/customer-reject",
                {
                    customer_number:
                        realNumber
                }
            );

        if (
            response.data.status ===
            "rejected"
        ) {

            await client.sendMessage(
                response.data.driver_number,
                "❌ الراكب رفض الرحلة"
            );

            await client.sendMessage(
                userId,
                "تم إلغاء الحجز"
            );

        }

    } catch (e) {

        console.log(
            "REJECT ERROR",
            e.message
        );

    }

    return;
}

if (
    rejectWords.includes(
        message.body.trim().toLowerCase()
    )
) {

    const contact =
        await message.getContact();

    const realNumber =
        contact.id._serialized;

    try {

        const response =
            await axios.post(
                "http://127.0.0.1:8001/customer-reject",
                {
                    customer_number:
                        realNumber
                }
            );

        if (
            response.data.status ===
            "rejected"
        ) {

            await client.sendMessage(
                response.data.driver_number,
                "❌ الراكب رفض الرحلة"
            );

            await client.sendMessage(
                userId,
                "تم إلغاء الحجز"
            );

        }

    } catch (e) {

        console.log(
            "REJECT ERROR",
            e.message
        );

    }

    return;
}
console.log(
    "MESSAGE BODY =",
    message.body
);
if (
    confirmWords.includes(
        message.body.trim().toLowerCase()
    )
) {

    const contact =
        await message.getContact();

    const realNumber =
        contact.id._serialized;

    console.log(
        "CUSTOMER CONFIRM DETECTED",
        realNumber
    );

    try {

        const response =
            await axios.post(
                "http://127.0.0.1:8001/customer-confirm",
                {
                    customer_number:
                        realNumber
                }
            );

        console.log(
            "CONFIRM RESPONSE =",
            response.data
        );

        // باقي الكود كما هو...
        if (
            response.data.status ===
            "confirmed"
        ) {

            const customerNumber =
                response.data.customer_number
                    .replace("@c.us", "")
                    .replace("@lid", "");

            const driverNumber =
                response.data.driver_number
                    .replace("@c.us", "")
                    .replace("@lid", "");

            await client.sendMessage(
                response.data.driver_number,

`✅ تم تأكيد الرحلة

رقم الراكب:

${customerNumber}

يرجى التواصل معه`
            );
            const chat =
    await client.getChatById(
        response.data.group_id
    );

const messages =
    await chat.fetchMessages({
        limit: 100
    });

const originalMessage =
    messages.find(
        m =>
            m.id._serialized ===
            response.data.message_id
    );

if (originalMessage) {

    await originalMessage.reply(
`✅ تم تأمين الرحلة

المسار:
${response.data.pickup}
⬇
${response.data.destination}`
    );

} else {

    await client.sendMessage(
        response.data.group_id,

`✅ تم تأمين الرحلة

المسار:
${response.data.pickup}
⬇
${response.data.destination}`
    );

}

            await client.sendMessage(
                userId,

`✅ تم تأكيد الرحلة

رقم السائق:

${driverNumber}

يرجى التواصل معه`
            );

        }

    } catch (e) {

        console.log(
            "CONFIRM ERROR",
            e.response?.data ||
            e.message
        );

    }

    return;
}
if (
    message.body.startsWith(
        "#interest "
    )
) {

    const keywords =
        message.body
            .replace(
                "#interest",
                ""
            )
            .trim()
            .split(/\s+/);

    try {

        for (
            const keyword
            of keywords
        ) {

            await axios.post(
                "http://127.0.0.1:8001/add-interest",
                {
                    driver_number:
                        userId,

                    keyword:
                        keyword
                }
            );

        }

        await client.sendMessage(
            userId,

`✅ تمت إضافة:

${keywords.join(", ")}`
        );

    } catch (e) {

        await client.sendMessage(
            userId,
            "❌ خطأ"
        );

    }

    return;
}
if (
    message.body ===
    "#myinterest"
) {

    try {

        const response =
            await axios.post(
                "http://127.0.0.1:8001/my-interests",
                {
                    driver_number:
                        userId
                }
            );

        let text =
            "🚖 اهتماماتك:\n\n";

        response.data.forEach(
            item => {

                text +=
                    "- " +
                    item +
                    "\n";

            }
        );

        await client.sendMessage(
            userId,
            text
        );

    } catch (e) {

        await client.sendMessage(
            userId,
            "❌ خطأ"
        );

    }

    return;
}
if (
    message.body.startsWith(
        "#take "
    )
) {

    const rideId =
        message.body
            .replace(
                "#take",
                ""
            )
            .trim();

    const contact =
    await message.getContact();

console.log(contact);        

    try {

        const contact =
    await message.getContact();

const realNumber =
    contact.id._serialized;

        const response =
            await axios.post(
                "http://127.0.0.1:8001/take-ride",
                {
                    ride_id:
                        Number(rideId),

                    driver_number:
                         realNumber
                }
            );

            if (
    response.data.status ===
    "already_taken"
) {

    await client.sendMessage(
        userId,
        "❌ هذه الرحلة تم حجزها بالفعل بواسطة سائق آخر"
    );

    return;
}

        if (
            response.data.status ===
            "pending_confirmation"
        ) {

            await client.sendMessage(
                response.data.customer_number,

`🚖 تم العثور على سائق

المسار:
${response.data.pickup}

⬇

${response.data.destination}

هل توافق على الرحلة؟

اكتب:

نعم

أو

لا`
            );

            await client.sendMessage(
                userId,

                "⏳ بانتظار موافقة الراكب"
            );

        }

    } catch (e) {

        console.log(
            "TAKE ERROR",
            e.message
        );

    }

    return;}

        console.log("FINAL USER ID =", userId);
        console.log("MESSAGE BODY =", message.body);

        // فحص الزوجة
        const isWife = wifeIds.some(
            id => userId.includes(id)
        );

        console.log("IS WIFE CHECK =", isWife);

        // إنشاء buffer للمستخدم
        if (!userBuffers[userId]) {

            userBuffers[userId] = {
                messages: [],
                timer: null
            };

        }

        // إضافة الرسالة
        userBuffers[userId].messages.push(
            message.body
        );

        // حذف التايمر القديم
        clearTimeout(
            userBuffers[userId].timer
        );

        // دمج الرسائل المتتالية
        userBuffers[userId].timer = setTimeout(async () => {

            try {

                const fullMessage =
                    userBuffers[userId]
                        .messages
                        .join(' ');

                console.log(
                    "FULL MESSAGE =",
                    fullMessage
                );

                // تنظيف buffer
                userBuffers[userId].messages = [];

                // إرسال للـ API
                const response = await axios.post(

                    'http://127.0.0.1:8001/chat',

                    {
                        user_id: userId,
                        text: fullMessage,
                        is_wife: isWife
                    }

                );

                const aiReply =
                    response.data.ai_reply;

                console.log(
                    "AI REPLY =",
                    aiReply
                );

                // إرسال الرد
                await client.sendMessage(
                    userId,
                    aiReply
                );

            } catch (error) {

                console.log(
                    "AI ERROR =",
                    error.response?.data ||
                    error.message
                );

                await client.sendMessage(
                    userId,
                    "صار خطأ صغير 😅"
                );

            }

        }, 2000);

    } catch (error) {

        console.log(
            "MAIN ERROR =",
            error.message
        );

    }

});

client.initialize();