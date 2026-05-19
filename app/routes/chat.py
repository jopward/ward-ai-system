from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import get_ai_reply
from app.services.memory_service import save_conversation

router = APIRouter()

class Message(BaseModel):
    text: str

@router.post("/chat")
def chat(message: Message):

    ai_reply = get_ai_reply(message.text)

    save_conversation(
        user_message=message.text,
        ai_reply=ai_reply
    )

    return {
        "user_message": message.text,
        "ai_reply": ai_reply
    }