import json
import re

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

        pickup = match.group(1).strip()
        destination = match.group(2).strip()

        destination = re.split(
            r"(?:الساعه|الساعة|ع ساعه|ع الساعة|على الساعه|على الساعة|صباحا|صباحاً|مساء|مساءً|غدا|غداً|بكره|بكرا)",
            destination,
            maxsplit=1
        )[0].strip()

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

    if "الان" in text:
        return "الآن"

    day = "اليوم"

    if "غدا" in text or "بكره" in text:
        day = "غداً"

    match = re.search(
        r"(?:الساعه|ع ساعه|على الساعه)\s*([0-9٠-٩:\.]+)",
        text
    )

    if match:
        return f"{day} {match.group(1)}"

    if "صباح" in text:
        return f"{day} صباحاً"

    if "مساء" in text:
        return f"{day} مساءً"

    return day