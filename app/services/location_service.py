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

    matches = find_locations(text)

    if len(matches) >= 2:

        return (
            matches[0]["name"],
            matches[1]["name"]
        )

    if len(matches) == 1:

        return (
            matches[0]["name"],
            "unknown"
        )

    return (
        "unknown",
        "unknown"
    )    