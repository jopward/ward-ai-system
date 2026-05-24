from app.core.database import SessionLocal
from app.models.conversation import Conversation


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
            "content": conv.content,
            "created_at": str(conv.created_at)
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

        if conv.role != "memory":

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

def get_user_memory(user_id):

    db = SessionLocal()

    memories = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.role == "memory"
    ).all()

    result = []

    for memory in memories:

        result.append(memory.content)

    db.close()

    return "\n".join(result)


    db = SessionLocal()

    memories = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.memory != ""
    ).all()

    result = []

    for memory in memories:

        result.append(memory.memory)

    db.close()

    return "\n".join(result)    

def delete_memory_type(user_id, keyword):

    db = SessionLocal()

    memories = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.role == "memory"
    ).all()

    for memory in memories:

        if keyword in memory.content:

            db.delete(memory)

    db.commit()

    db.close()    