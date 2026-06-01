KNOWN_KEYWORDS = [

    "اربد",
    "عمان",
    "الزرقاء",
    "جرش",
    "عجلون",
    "المفرق",
    "السلط",
    "العقبة",
    "الكرك",
    "المطار",
    "جامعة",
    "مستشفى"
]


def extract_keywords(text):

    text = text.lower()

    result = []

    for keyword in KNOWN_KEYWORDS:

        if keyword in text:

            result.append(
                keyword
            )

    return result


def is_driver_post(text):

    text = text.lower()

    driver_words = [

        "مطلوب ركاب",
        "بحاجة ركاب",
        "سيارة طالعة",
        "باقي مقعدين",
        "باقي راكب",
        "طلعتي"
    ]

    for word in driver_words:

        if word in text:

            return True

    return False