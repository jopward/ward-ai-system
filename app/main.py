from fastapi import FastAPI
from pydantic import BaseModel

from app.core.database import engine, Base
from app.models.conversation import Conversation

from app.services.ai_service import get_ai_reply
from app.services.memory_service import save_message, get_history

app = FastAPI()

Base.metadata.create_all(bind=engine)


class Message(BaseModel):
    user_id: str
    text: str


@app.get("/")
def home():
    return {
        "message": "Ward AI System Running"
    }


@app.get("/about")
def about():
    return {
        "project": "Ward AI Automation",
        "version": "1.0",
        "status": "Running"
    }


@app.post("/chat")
def chat(message: Message):

    user_id = message.user_id
    text = message.text

    ai_reply = get_ai_reply(user_id, text)

    return {
        "user_message": text,
        "ai_reply": ai_reply
    }


@app.get("/history")
def history():
    return get_history()