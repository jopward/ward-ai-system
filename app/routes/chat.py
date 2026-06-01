from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import get_ai_reply
from app.services.memory_service import save_conversation

router = APIRouter()

class Message(BaseModel):
    user_id: str
    text: str
    is_wife: bool = False

@router.post("/chat")
def chat(message: Message):
    print("API IS_WIFE =", message.is_wife)
    ai_reply = get_ai_reply(
        message.user_id,
        message.text,
        message.is_wife
    )

    save_conversation(
        user_message=message.text,
        ai_reply=ai_reply
    )

    return {
        "user_message": message.text,
        "ai_reply": ai_reply
    }