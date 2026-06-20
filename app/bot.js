const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const OWNER_NUMBER = "90688670703663@lid";
const DRIVER_GROUP_ID =
"120363425338510691@g.us";

const pendingRejectTimers = {};

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
let BOT_ENABLED = true;
let PASSENGER_GROUP_PUBLISH = true;
let BADWORDS_ENABLED = true;
let DRIVERS_ENABLED = true;

const pendingConfirmations = {};
const pendingRejectChoice = {};
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

const userBuffers = {};

const wifeIds = [

    "962785021861",
    "159683327295736"


];

//"90688670703663"
 

client.on('message', async (message) => {

    try {
        console.log(
            "MESSAGE BODY =",
            message.body
        );
        console.log(
    "FROM =",
    message.from
);

console.log(
    "TYPE =",
    message.type
);
const isGroup = message.from.includes("@g.us");
const userId = message.from;
if (
    message.from === OWNER_NUMBER &&
    message.body === "#off"
) {

    BOT_ENABLED = false;

    await message.reply(
        "⛔ تم إيقاف البوت"
    );

    return;
}

if (
    message.from === OWNER_NUMBER &&
    message.body === "#on"
) {

    BOT_ENABLED = true;

    await message.reply(
        "✅ تم تشغيل البوت"
    );

    return;
}
if (
    message.from === OWNER_NUMBER &&
    message.body === "#publish_off"
) {

    PASSENGER_GROUP_PUBLISH = false;

    await message.reply(
        "⛔ تم إيقاف النشر في مجموعة الركاب"
    );

    return;
}

if (
    message.from === OWNER_NUMBER &&
    message.body === "#publish_on"
) {

    PASSENGER_GROUP_PUBLISH = true;

    await message.reply(
        "✅ تم تفعيل النشر في مجموعة الركاب"
    );

    return;
}
if (
    message.from === OWNER_NUMBER &&
    message.body === "#badwords_off"
) {

    BADWORDS_ENABLED = false;

    await message.reply(
        "⛔ تم تعطيل فلتر الكلمات المسيئة"
    );

    return;
}

if (
    message.from === OWNER_NUMBER &&
    message.body === "#badwords_on"
) {

    BADWORDS_ENABLED = true;

    await message.reply(
        "✅ تم تفعيل فلتر الكلمات المسيئة"
    );

    return;
}
if (
    message.from === OWNER_NUMBER &&
    message.body === "#drivers_off"
) {

    DRIVERS_ENABLED = false;

    await message.reply(
        "⛔ تم إيقاف إرسال الطلبات للسائقين"
    );

    return;
}

if (
    message.from === OWNER_NUMBER &&
    message.body === "#drivers_on"
) {

    DRIVERS_ENABLED = true;

    await message.reply(
        "✅ تم تفعيل إرسال الطلبات للسائقين"
    );

    return;
}
        if (!BOT_ENABLED) {
    return;
}
       
  if (
    message.body.trim() === "طلبات"
) {
    console.log("REQUESTS COMMAND DETECTED");
    console.log(
        "REQUESTS COMMAND DETECTED"
    );

    const response =
        await axios.get(
            "http://127.0.0.1:8001/new-rides"
        );

    if (
        response.data.length === 0
    ) {

        await client.sendMessage(
            message.from,
            "لا يوجد طلبات حالياً"
        );

        return;
    }

    for (
        const ride
        of response.data
    ) {
console.log("RIDE =", ride);
        const created =
            new Date(
                ride.created_at
            );

        const now =
            new Date();

        const minutes =
            Math.floor(
                (now - created) / 60000
            );

        let age = "";

        if (minutes < 60) {

            age =
                `منذ ${minutes} دقيقة`;

        } else {

            age =
                `منذ ${Math.floor(minutes / 60)} ساعة`;
        }

        await client.sendMessage(
            message.from,

`🚖 #take ${ride.ride_id}

📍 ${ride.pickup} ← ${ride.destination}
📝${ride.message}
🕒 ${age}`
        );
    }

    return;
}

const destinationMatch =
    message.body.match(
        /^بدي ركاب\s+ل(.+)$/i
    );

if (destinationMatch) {

    const destination =
        destinationMatch[1].trim();

    const response =
        await axios.get(
`http://127.0.0.1:8001/rides-by-destination/${destination}`
        );

    let text =
`🚖 طلبات إلى ${destination}

`;

    for (const ride of response.data) {

        text +=
`#take ${ride.ride_id}
📍 ${ride.pickup} ← ${ride.destination}

`;
    }

    await client.sendMessage(
        message.from,
        text
    );

    return;
}   if (
    message.from === OWNER_NUMBER &&
    message.body.startsWith("#system")
)
 {

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
const badWords = [
    "محترم",
    "لعنة",
    "قذر",
    "حمار",
    "تيس",
    "كس",
    "اختك",
    "أختة",
    "اخته",
     "قحبة",
     "كس",
    "الشرموطة",
    "أختة",
    "اخته",
     "قحبة",
     "الشرموطه",
     "كلب",
     "يلعن",
     "يلعنك",
     "تعريس",
     "بغل",
     "الداعرة",
     "ملعون",
     "ينعن",
     "قحبة",
     "اعمى",
    "خرا",
    "خرأ",
    "زب",
    "سكس",
    "ولك",
    "خاوه",
    "خاوة",
    "حيوان",
    "خواتي",
    "شرفي",
    "وله",
    "ولك",
    "منيك",
    "منيوك",
    "لعنة",
    "لعنه",

];

const text =
    message.body.toLowerCase();

if (
    BADWORDS_ENABLED &&
    badWords.some(
        word => text.includes(word)
    )
) {

    await message.delete(true);

    await client.sendMessage(
        message.from,
        `⚠️ يرجى الالتزام بقوانين المجموعة وعدم استخدام الألفاظ غير اللائقة.`
    );

    return;
}

              const ACCEPT_WORDS = [
    "احجز",
    "تم",
    "اوك",
    "ok",
    "موافق",
    "جاهز"
];

if (
    message.hasQuotedMsg &&
    ACCEPT_WORDS.includes(
        message.body.trim().toLowerCase()
    )
) {

    const quoted =
        await message.getQuotedMessage();

    const match =
        quoted.body.match(
            /#take\s+(\d+)/
        );

    if (!match) {
        return;
    }

    const rideId =
        Number(match[1]);

    const contact =
        await message.getContact();

    const realNumber =
        contact.id._serialized;

    const response =
        await axios.post(
            "http://127.0.0.1:8001/take-ride",
            {
                ride_id: rideId,
                driver_number: realNumber
            }
        );

    console.log(
        "GROUP TAKE RESPONSE =",
        response.data
    );

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
اكتب: نعم أو لا`
        );

        await client.sendMessage(
            realNumber,
            "⏳ بانتظار موافقة الراكب"
        );
    }

    return;
}
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
    if (!DRIVERS_ENABLED) {

    console.log(
        "DRIVER PUBLISH DISABLED"
    );

    return;
}

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
            const customerNumber =
    contact.id.user;
            await client.sendMessage(
    driver,
`🚖 #take ${response.data.ride_id}
📞 ${customerNumber}
📍 ${response.data.pickup} ← ${response.data.destination}
🕒 ${response.data.ride_time}
📝${message.body}`

);
await axios.post(
    "http://127.0.0.1:8001/save-ride-notification",
    {
        ride_id:
            response.data.ride_id,

        driver_number:
            driver
    }
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
    "5 MIN CHECK =",
    JSON.stringify(check.data)
);

            if (
                check.data.status ===
                "NEW"
            ) {
               const customerNumber =
    contact.id.user;
               await client.sendMessage(
    DRIVER_GROUP_ID,

`🚖 #take ${response.data.ride_id}
📞 ${customerNumber}
📍 ${response.data.pickup} ← ${response.data.destination}
🕒 ${response.data.ride_time}
📝 ${message.body}`

);

 console.log(
    "PUBLISHED TO DRIVER GROUP"
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



 

  
if (
    rejectWords.includes(
        message.body.trim().toLowerCase()
    )
) {

    const contact =
        await message.getContact();

    const realNumber =
        contact.id._serialized;
        const check =
    await axios.post(
        "http://127.0.0.1:8001/check-pending-confirmation",
        {
            customer_number:
                realNumber
        }
    );console.log(
    "PENDING CHECK =",
    JSON.stringify(
        pendingResponse.data
    )
);

console.log(
    "REAL NUMBER =",
    realNumber
);

if (
    check.data.status ===
    "ride_not_found"
) {

    await client.sendMessage(
        userId,
        "❌ لا يوجد طلب بانتظار الموافقة"
    );

    return;
}
  

    if (
        pendingConfirmations[
            realNumber
        ]
    ) {

        clearTimeout(
            pendingConfirmations[
                realNumber
            ]
        );

        delete pendingConfirmations[
            realNumber
        ];
    }

 pendingRejectChoice[
    userId
] = true;

if (
    pendingRejectTimers[userId]
) {

    clearTimeout(
        pendingRejectTimers[userId]
    );
}

pendingRejectTimers[
    userId
] = setTimeout(
    async () => {

        try {

            const contact =
                await message.getContact();

            const realNumber =
                contact.id._serialized;

            const cancelResponse =
                await axios.post(
                    "http://127.0.0.1:8001/cancel-customer-ride",
                    {
                        customer_number:
                            realNumber
                    }
                );

            if (
                cancelResponse.data
                    .driver_number
            ) {

                await client.sendMessage(
                    cancelResponse.data
                        .driver_number,

`❌ لم يرد الراكب خلال المهلة
تم إلغاء الحجز المبدئي`
                );

            }

            await client.sendMessage(
                userId,

`⌛ انتهت مهلة الاختيار
تم إلغاء الرحلة تلقائياً`
            );

            delete pendingRejectChoice[
                userId
            ];

            delete pendingRejectTimers[
                userId
            ];

        } catch (e) {

            console.log(
                "REJECT TIMEOUT ERROR",
                e.message
            );

        }

    },
    60000
);

await client.sendMessage(
    userId,

`❓ هل تريد:

1️⃣ إلغاء الرحلة

2️⃣ البحث عن سائق آخر

⏳ لديك دقيقة واحدة للاختيار

اكتب:
1 أو 2`
);

return;
}
if (
    pendingRejectChoice[
        userId
    ]
) {

   if (
    message.body.trim() === "1"
) {

    const contact =
        await message.getContact();

    const realNumber =
        contact.id._serialized;
if (
    pendingRejectTimers[userId]
) {

    clearTimeout(
        pendingRejectTimers[userId]
    );

    delete pendingRejectTimers[
        userId
    ];
}
    delete pendingRejectChoice[
        userId
    ];

    const cancelResponse =
    await axios.post(
        "http://127.0.0.1:8001/cancel-customer-ride",
        {
            customer_number:
                realNumber
        }
    );

if (
    cancelResponse.data.driver_number
) {

    await client.sendMessage(
        cancelResponse.data.driver_number,

`❌ تم إلغاء الرحلة من قبل الراكب`
    );

}

await client.sendMessage(
    userId,
    "✅ تم إلغاء الرحلة نهائياً"
);

    return;
}

   if (
    message.body.trim() === "2"
) {
    if (
    pendingRejectTimers[userId]
) {

    clearTimeout(
        pendingRejectTimers[userId]
    );

    delete pendingRejectTimers[
        userId
    ];
}

    console.log(
        "OPTION 2 STARTED"
    );

    delete pendingRejectChoice[
        userId
    ];
    delete pendingRejectTimers[
    userId
];

    const contact =
        await message.getContact();

    const realNumber =
        contact.id._serialized;

    const response =
        await axios.post(
            "http://127.0.0.1:8001/search-new-driver",
            {
                customer_number:
                    realNumber
            }
        );

    console.log(
        "SEARCH RESPONSE =",
        response.data
    );

    await client.sendMessage(
        userId,
        "🔍 جاري البحث عن سائق آخر..."
    );

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

        const notified =
    await axios.post(
        "http://127.0.0.1:8001/notified-drivers",
        {
            ride_id:
                response.data.ride_id
        }
    );

console.log(
    "NOTIFIED DRIVERS =",
    notified.data
);

   console.log(
    "FOUND DRIVERS =",
    drivers.data
);

let sentCount = 0;
for (
    const driver
    of drivers.data
) {

    if (
        driver ===
        response.data.old_driver
    ) {

        console.log(
            "SKIP OLD DRIVER"
        );

        continue;
    }
    if (
    notified.data.includes(
        driver
    )
) {

    console.log(
        "ALREADY NOTIFIED =",
        driver
    );

    continue;
}

    console.log(
        "SENDING TO DRIVER =",
        driver
    );
    
    const customerNumber =
    contact.id.user;
    await client.sendMessage(
    driver,
`🚖 #take ${response.data.ride_id}
📞 ${customerNumber}
📍 ${response.data.pickup} ← ${response.data.destination}
🕒 ${response.data.ride_time}
📝 ${message.body}`

);await axios.post(
    "http://127.0.0.1:8001/save-ride-notification",
    {
        ride_id:
            response.data.ride_id,

        driver_number:
            driver
    }
);sentCount++;
}
if (
    sentCount === 0
) {

    await client.sendMessage(
        userId,
        "❌ لا يوجد حالياً سائق آخر متاح لهذا المسار"
    );
}
return;
}

    await client.sendMessage(
        userId,
        "اكتب 1 أو 2 فقط"
    );

    return;
}
console.log(
    "MESSAGE BODY =",
    message.body
);
console.log(
    "MESSAGE BODY =",
    message.body
);

const contact =
    await message.getContact();

const realNumber =
    contact.id._serialized;

const pendingResponse =
    await axios.post(
        "http://127.0.0.1:8001/check-pending-confirmation",
        {
            customer_number:
                realNumber
        }
    );
    console.log(
    "PENDING CHECK =",
    pendingResponse.data
);

console.log(
    "REAL NUMBER =",
    realNumber
);

if (
    pendingResponse.data.status ===
    "PENDING_CONFIRMATION"
    &&
    !confirmWords.includes(
        message.body.trim().toLowerCase()
    )
    &&
    !rejectWords.includes(
        message.body.trim().toLowerCase()
    )
){

    await client.sendMessage(
        message.from,

`⚠️ لديك رحلة بانتظار التأكيد

اكتب فقط:

نعم

أو

لا`
    );

    return;
}


if (
    confirmWords.includes(
        message.body.trim().toLowerCase()
    )
) {


    if (
    pendingConfirmations[
        realNumber
    ]
) {

    clearTimeout(
        pendingConfirmations[
            realNumber
        ]
    );

    delete pendingConfirmations[
        realNumber
    ];
}    

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

if (PASSENGER_GROUP_PUBLISH) {

    if (originalMessage) {

        await originalMessage.reply(
`✅ تم تأمينك سيتواصل معك السائق الان`
        );

    } else {

        await client.sendMessage(
            response.data.group_id,

`✅ تم تأمينك سيتواصل معك السائق الان`
        );

    }

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
const ACCEPT_WORDS = [
    "احجز",
    "تم",
    "اوك",
    "ok",
    "موافق",
    "جاهز"
];

if ( 
    message.hasQuotedMsg &&
    ACCEPT_WORDS.includes(
        message.body.trim().toLowerCase()
    )
) {

    try {

        const quoted =
            await message.getQuotedMessage();
            console.log(
    "QUOTED BODY =",
    quoted.body
);

console.log(
    "FROM =",
    message.from
);

console.log(
    "HAS QUOTED =",
    message.hasQuotedMsg
);

        const match =
            quoted.body.match(
                /#take\s+(\d+)/
            );

        if (!match) {

            return;

        }

        const rideId =
            Number(match[1]);

        const contact =
            await message.getContact();

        const realNumber =
            contact.id._serialized;

        const response =
            await axios.post(
                "http://127.0.0.1:8001/take-ride",
                {
                    ride_id: rideId,
                    driver_number: realNumber
                }
            );

        if (
            response.data.status ===
            "expired"
        ) {

            await client.sendMessage(
                message.from,
                "⏰ انتهت صلاحية هذه الرحلة"
            );

            return;

        }

        if (
            response.data.status ===
            "already_taken"
        ) {

            await client.sendMessage(
                message.from,
                "❌ هذه الرحلة تم حجزها بواسطة سائق آخر"
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
اكتب : نعم او لا`
    );await client.sendMessage(
    realNumber,
    "⏳ بانتظار موافقة الراكب"
);

pendingConfirmations[
    response.data.customer_number
] = setTimeout(
    async () => { 
        console.log(
            "TIMEOUT FIRED",
            response.data.customer_number
        );

        try {

            await axios.post(
                "http://127.0.0.1:8001/expire-ride",
                {
                    customer_number:
                        response.data.customer_number
                }
            );

            await client.sendMessage(
                response.data.customer_number,

`⌛ انتهت مهلة تأكيد الرحلة

إذا كنت ما زلت بحاجة إلى مشوار،
أرسل طلباً جديداً`
            );

            await client.sendMessage(
                response.data.driver_number,

`⌛ لم يرد الراكب خلال المهلة

تم إلغاء الحجز المبدئي`
            );

        } catch (e) {

            console.log(
                "TIMEOUT ERROR",
                e.message
            );

        }

        delete pendingConfirmations[
            response.data.customer_number
        ];

    },
    180000
);

}
    } catch (e) {

        console.log(
            "REPLY TAKE ERROR",
            e.message
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
    "expired"
) {

    await client.sendMessage(
        message.from,
        "⏰ انتهت صلاحية هذه الرحلة"
    );

    return;
}

            if (
    response.data.status ===
    "already_taken"
) {

    await client.sendMessage(
        userId,
        "❌ هذه الرحلة تم حجزها بواسطة سائق آخر"
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
اكتب : نعم او لا `
            );

            await client.sendMessage(
                userId,

                "⏳ بانتظار موافقة الراكب"
            );
            pendingConfirmations[
    response.data.customer_number
] = setTimeout(
    async () => {

        try {

            await axios.post(
    "http://127.0.0.1:8001/expire-ride",
    {
        customer_number:
            response.data.customer_number
    }
);

            await client.sendMessage(
                response.data.customer_number,

`⌛ انتهت مهلة تأكيد الرحلة

إذا كنت ما زلت بحاجة إلى مشوار،
أرسل طلباً جديداً`
            );

            await client.sendMessage(
                response.data.driver_number,

`⌛ لم يرد الراكب خلال المهلة

تم إلغاء الحجز المبدئي`
            );

        } catch (e) {

            console.log(
                "TIMEOUT ERROR",
                e.message
            );

        }

        delete pendingConfirmations[
            response.data.customer_number
        ];

    },
    180000
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
                /*
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
                */

                  /*
               await client.sendMessage(
    userId,

`🚖 مرحباً بك في Ward AI للنقل

لإنشاء طلب:
بدي سيارة من اربد إلى عمان

أوامر السائق:

طلبات
بدي ركاب لاربد
بدي ركاب من صما

للتسجيل:
#interest اربد`
);

return;
 */
return;

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