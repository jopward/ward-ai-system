user_modes = {}


def set_mode(user_id, mode):

    user_modes[user_id] = mode


def get_mode(user_id):

    return user_modes.get(
        user_id,
        "assistant"
    )