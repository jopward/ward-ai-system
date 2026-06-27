const axios = require("axios");

async function handleIncomingRide(
    client,
    customerNumber,
    rideText,
    groupId,
    messageId,
    DRIVER_GROUP_ID,
    DRIVERS_ENABLED
) {

    const response =
        await axios.post(
            "http://127.0.0.1:8001/ride-test",
            {
                user_id:
                    customerNumber + "@c.us",

                text:
                    rideText,

                is_wife:
                    false,

                group_id:
                    groupId,

                message_id:
                    messageId
            }
        );

    console.log(
        "RIDE RESULT =",
        response.data
    );

    if (
        response.data.status !==
        "saved"
    ) {

        return response;

    }

    if (!DRIVERS_ENABLED) {

        console.log(
            "DRIVER PUBLISH DISABLED"
        );

        return response;
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

        await client.sendMessage(
            `${driver}@c.us`,
`🚖 #take ${response.data.ride_id}
📞 ${customerNumber}
📍 ${response.data.pickup} ← ${response.data.destination}
🕒 ${response.data.ride_time}
📝${rideText}`
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
            "SEND DRIVER ERROR FULL =",
            e
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
                ride
            );

            if (
                ride.status ===
                "NEW"
            ) {

                await client.sendMessage(
                    DRIVER_GROUP_ID,

`🚖 #take ${response.data.ride_id}
📞 ${customerNumber}
📍 ${response.data.pickup} ← ${response.data.destination}
🕒 ${response.data.ride_time}
📝${rideText}`                );

                console.log(
                    "PUBLISHED TO DRIVER GROUP"
                );

                await client.sendMessage(
                    `${ride.customer_number}@c.us`,
                    "⏳ ما زلنا نبحث عن سائق مناسب لرحلتك"
                );

            }

        } catch (e) {

            console.log(
                "CHECK ERROR =",
                e.message
            );

        }

    },
    300000
);
    return response;
}

module.exports = {
    handleIncomingRide
};