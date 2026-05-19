import os

from groq import Groq
from dotenv import load_dotenv
from app.services.mode_service import get_mode

from app.services.memory_service import (
    save_message,
    get_messages
)

from app.services.tools_service import run_tool

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)




def get_ai_reply(user_id, message):

    # تشغيل الأدوات أولاً
    tool_result = run_tool(user_id, message)
    mode = get_mode(user_id)

    system_prompt = f"""
أنت Ward AI Agent.

الوضع الحالي:
{mode}

إذا كان الوضع:
- programmer → خبير برمجة
- teacher → معلم محترف
- business → خبير أعمال
- assistant → مساعد عام

تحدث بالعربية وباختصار.
"""
    
    if tool_result:
        return tool_result

    # حفظ رسالة المستخدم
    save_message(user_id, "user", message)

    # بناء المحادثة
    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    # إضافة الذاكرة السابقة
    messages.extend(get_messages(user_id))

    # إرسال الطلب للذكاء الاصطناعي
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.7
    )

    ai_reply = completion.choices[0].message.content

    # حفظ رد الذكاء الاصطناعي
    save_message(user_id, "assistant", ai_reply)

    return ai_reply