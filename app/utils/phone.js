function normalizePhone(phone) {

    if (!phone) {
        return "";
    }

    return String(phone)
        .replace("@c.us", "")
        .replace("@lid", "")
        .trim();
}

module.exports = {
    normalizePhone
};