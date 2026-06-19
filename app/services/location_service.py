import json
import re
from difflib import get_close_matches

with open(
    "app/data/jordan_places_for_transport.json",
    "r",
    encoding="utf-8"
) as f:

    PLACES = json.load(f)


def normalize(text):

    text = text.strip()

    replacements = {
        "أ": "ا",
        "إ": "ا",
        "آ": "ا",
        "ة": "ه",
        "ى": "ي"
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    return text

def correct_place_name(name):

    name = normalize(name)

    all_places = [
        normalize(place["name"])
        for place in PLACES
    ]

    match = get_close_matches(
        name,
        all_places,
        n=1,
        cutoff=0.45
    )

    if match:

        print(
            "PLACE FIX:",
            name,
            "->",
            match[0]
        )

        return match[0]

    return name

def find_locations(text):

    text_norm = normalize(text)

    matches = []

    for place in PLACES:

        place_name = normalize(
            place["name"]
        )

        if place_name in text_norm:

            matches.append(place)

    return matches


def extract_pickup_destination(text):

    text = normalize(text)

    match = re.search(
        r"من\s+(.*?)\s+(?:الى|الي|ل)\s+(.*)",
        text,
        re.IGNORECASE
    )

    if match:

        pickup = correct_place_name(
            match.group(1).strip()
        )

        destination = match.group(2).strip()

        destination = re.split(
            r"(?:الساعه|الساعة|ع ساعه|ع الساعة|على الساعه|على الساعة|صباحا|صباحاً|مساء|مساءً|غدا|غداً|بكره|بكرا)",
            destination,
            maxsplit=1
        )[0].strip()

        pickup = correct_place_name(pickup)
        destination = correct_place_name(destination)
        

        return (
            pickup,
            destination
        )

    matches = find_locations(text)

    unique_places = []

    for place in matches:

        if place["name"] not in unique_places:

            unique_places.append(
                place["name"]
            )

    if len(unique_places) >= 2:

        return (
            unique_places[0],
            unique_places[-1]
        )

    if len(unique_places) == 1:

        return (
            unique_places[0],
            "unknown"
        )

    return (
        "unknown",
        "unknown"
    )
def extract_time(text):

    text = normalize(text) 

    
    arabic_numbers = {
        "واحد": "1",
        "اثنين": "2",
        "ثنين": "2",
        "ثلاثه": "3",
        "اربعه": "4",
        "خمسه": "5",
        "سته": "6",
        "سبعه": "7",
        "ثمانيه": "8",
        "تسعه": "9",
        "عشره": "10",
        "احدعش": "11",
        "اثنعش": "12"
    }

    for word, number in arabic_numbers.items():

        text = text.replace(
            word,
            number
        )

    if "الان" in text:
        return "الآن"

    day = "اليوم"

    if "غدا" in text or "بكره" in text:
        day = "غداً"

    # الساعة 8 وربع
    match = re.search(
        r"(?:الساعه|الساعة)\s*(\d+)\s*وربع",
        text
    )

    if match:

        return (
            f"{day} "
            f"{match.group(1)}:15"
        )

    # الساعة 8 ونص
    match = re.search(
        r"(?:الساعه|الساعة)\s*(\d+)\s*(?:ونص|ونصف)",
        text
    )

    if match:

        return (
            f"{day} "
            f"{match.group(1)}:30"
        )

    # الساعة 9 الا ربع
    match = re.search(
        r"(?:الساعه|الساعة)\s*(\d+)\s*الا\s*ربع",
        text
    )

    if match:

        hour = int(
            match.group(1)
        ) - 1

        return (
            f"{day} "
            f"{hour}:45"
        )

    # الساعة 8
    match = re.search(
        r"(?:الساعه|الساعة|ع ساعه|ع الساعة|على الساعه|على الساعة)\s*([0-9٠-٩:\.]+)",
        text
    )

    if match:

        return (
            f"{day} "
            f"{match.group(1)}"
        )

    if "صباح" in text:
        return f"{day} صباحاً"

    if "مساء" in text:
        return f"{day} مساءً"

    return day
