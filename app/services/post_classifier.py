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

    if len(text.split()) < 3:
        return "unknown"

    passenger_patterns = [

        "راكب من",
        "راكب الى",
        "راكب ع",
        "راكب بدو",
        "راكب بده",
        "راكب بحاجه",

        "راكبين من",
        "راكبين الى",
        "راكبين بحاجه",

        "مطلوب سياره",
        "بدي سياره",
        "اريد سياره",
        "بحاجه سياره",
        "بحاجه الى سياره",

        "مطلوب توصيله",
        "بحاجه توصيله",

        "اوردر من",
        "مشوار من",

        "مين طالع",
        "مين نازل",

        "بدي اوصل",
        "بده يوصل",
        "بدو يوصل"
    ]

    driver_patterns = [

        "بحاجه راكب",
        "بحاجه راكبين",
        "بحاجه الى راكب",
        "بحاجه الى راكبين",

        "متوفر مقعد",
        "متوفر مقعدين",

        "عندي مقعد",
        "عندي مقعدين",

        "مقاعد",
        "مقعدين",

        "تحميل",

        "سياره الان",
        "سياره غدا",
        "سياره بكره",
        "سياره الخميس",

        "طالع من",
        "نازل على",

        "متوفر اماكن"
    ]

    for pattern in passenger_patterns:

        if pattern in text:
            return "passenger"

    # راكب بكره الساعه 8
    # راكب اليوم
    # راكبين صما اربد
    if text.startswith("راكب"):
        return "passenger"

    if text.startswith("راكبه"):
        return "passenger"

    if text.startswith("راكبين"):
        return "passenger"

    for pattern in driver_patterns:

        if pattern in text:
            return "driver"

    if text.startswith("سياره"):
        return "driver"

    return "unknown"