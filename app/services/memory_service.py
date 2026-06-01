from app.core.database import SessionLocal
from app.models.conversation import (
    Conversation,
    SystemPrompt
)


def save_message(user_id, role, content):

    db = SessionLocal()

    conversation = Conversation(
        user_id=user_id,
        role=role,
        content=content
    )

    db.add(conversation)
    db.commit()
    db.close()


def get_history():

    db = SessionLocal()

    conversations = db.query(Conversation).all()

    result = []

    for conv in conversations:

        result.append({
            "user_id": conv.user_id,
            "role": conv.role,
            "content": conv.content
        })

    db.close()

    return result


def get_messages(user_id):

    db = SessionLocal()

    conversations = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).all()

    messages = []

    for conv in conversations:

        messages.append({
            "role": conv.role,
            "content": conv.content
        })

    db.close()

    return messages

def clear_memory(user_id):

    db = SessionLocal()

    db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).delete()

    db.commit()

    db.close()

def save_system_prompt(content):

    db = SessionLocal()

    prompt = SystemPrompt(
        content=content
    )

    db.add(prompt)

    db.commit()

    db.close()


def get_system_prompts():

    db = SessionLocal()

    prompts = db.query(
        SystemPrompt
    ).all()

    result = []

    for prompt in prompts:

        result.append(prompt.content)

    db.close()

    return "\n".join(result)    