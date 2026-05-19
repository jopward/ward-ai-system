from datetime import datetime

from app.services.memory_service import (
    clear_memory,
    get_messages
)

from app.services.mode_service import (
    set_mode
)

def run_tool(user_id, message):

    message = message.lower()

    # آلة حاسبة
    if "احسب" in message:

        try:

            expression = (
                message
                .replace("احسب", "")
                .strip()
            )

            result = eval(expression)

            return f"الناتج هو: {result}"

        except:

            return "حدث خطأ بالحساب"

    # الوقت
    if "الوقت" in message:

        now = datetime.now()

        return now.strftime(
            "الوقت الآن: %H:%M:%S"
        )

    # مسح الذاكرة
    if message == "/reset":

        clear_memory(user_id)

        return "تم مسح الذاكرة"

    # عرض المحادثات
    if message == "/history":

        messages = get_messages(user_id)

        if not messages:
            return "لا يوجد محادثات"

        result = ""

        for msg in messages[-6:]:

            result += (
                f"{msg['role']}: "
                f"{msg['content']}\n"
            )

        return result

    # المساعدة
    if message == "/help":

        return """
الأوامر المتاحة:

احسب 5+5
الوقت
/history
/reset
/help
"""
    # معلومات البوت
    if message == "/about":

        return """
🤖 Ward AI Agent

نسخة:
1.0

المميزات:
- ذكاء اصطناعي
- ذاكرة
- أدوات ذكية
- واتساب AI
"""

    # اختبار
    if message == "/ping":

        return "pong 🏓"
    
    # وضع المبرمج
    if message == "/programmer":

        set_mode(user_id, "programmer")

        return "تم تفعيل وضع المبرمج 👨‍💻"

    # وضع المعلم
    if message == "/teacher":

        set_mode(user_id, "teacher")

        return "تم تفعيل وضع المعلم 👨‍🏫"

    # وضع الأعمال
    if message == "/business":

        set_mode(user_id, "business")

        return "تم تفعيل وضع الأعمال 💼"

    # الوضع العادي
    if message == "/assistant":

        set_mode(user_id, "assistant")

        return "تم تفعيل الوضع العادي 🤖"    
    return None