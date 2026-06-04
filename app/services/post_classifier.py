def classify_post(text):

    print("TEXT =", repr(text))

    text = text.strip().lower()

    text = (
        text.replace("أ", "ا")
            .replace("إ", "ا")
            .replace("آ", "ا")
            .replace("ة", "ه")
    )

    print("AFTER STRIP =", repr(text))

    driver_patterns = [

        "بحاجه راكب",
        "بحاجه راكبين",
        "بحاجه الى راكب",
        "بحاجه الى راكبين",
        "راكبين",
        "مقاعد",
        "مقعدين",
        "متوفر مقعد",
        "متوفر مقعدين",
        "تحميل",
        "سياره من",
        "سياره الخميس",
        "سياره الان",
        "سياره غدا"
    ]

    for pattern in driver_patterns:

        if pattern in text:

            return "driver"

    passenger_patterns = [

        "بحاجه سياره",
        "مطلوب سياره",
        "مطلوب توصيله",
        "توصيله",
        "بدي سياره",
        "اريد سياره",
        "مين طالع",
        "راكب من",
        "راكب بدو",
        "راكب بحاجه",
        "بحاجه الى سياره",
        "بحاجه توصيله"
    ]

    for pattern in passenger_patterns:

        if pattern in text:

            return "passenger"

    if text.startswith("راكب"):

        return "passenger"

    if text.startswith("سياره"):

        return "driver"

    return "unknown"