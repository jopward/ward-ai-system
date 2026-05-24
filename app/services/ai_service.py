import os

from groq import Groq
from dotenv import load_dotenv

from app.services.mode_service import get_mode

from app.services.memory_service import (
    save_message,
    get_messages,
    get_user_memory,
    delete_memory_type
)

from app.services.tools_service import run_tool

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def extract_memory(user_id, message):

    memory = []

    if "اسمي" in message:

        delete_memory_type(
            user_id,
            "اسم المستخدم"
        )

        name = message.split("اسمي")[-1].strip()

        memory.append(
            f"اسم المستخدم: {name}"
        )

    if "بحب" in message:

        delete_memory_type(
            user_id,
            "يحب"
        )

        hobby = message.split("بحب")[-1].strip()

        memory.append(
            f"يحب: {hobby}"
        )

    if "بشتغل" in message:

        delete_memory_type(
            user_id,
            "العمل"
        )

        work = message.split("بشتغل")[-1].strip()

        memory.append(
            f"العمل: {work}"
        )

    if "عمري" in message:

        delete_memory_type(
            user_id,
            "العمر"
        )

        age = message.split("عمري")[-1].strip()

        memory.append(
            f"العمر: {age}"
        )

    return "\n".join(memory)


def get_ai_reply(user_id, message):

    # تشغيل الأدوات أولاً
    tool_result = run_tool(user_id, message)

    if tool_result:
        return tool_result

    mode = get_mode(user_id)

    # حفظ رسالة المستخدم
    save_message(
        user_id,
        "user",
        message
    )

    # استخراج الذاكرة
    memory = extract_memory(
        user_id,
        message
    )

    if memory:

        save_message(
            user_id,
            "memory",
            memory
        )

    # جلب ذاكرة المستخدم
    user_memory = get_user_memory(user_id)

    system_prompt = f"""
أنت Ward AI.

الوضع الحالي:
{mode}

إذا كان الوضع:
- programmer → خبير برمجة
- teacher → معلم محترف
- business → خبير أعمال
- assistant → مساعد عام

أنت مساعد أردني ذكي تتحدث باللهجة الأردنية/الشامية فقط.

قواعد مهمة جداً:

- ممنوع استخدام اللهجة المصرية أو المغربية أو الخليجية.
- لا تستخدم كلمات مثل:
ازيك، عامل ايه، أوي، عايز، بتاع، مش، بزاف، برشا.

- استخدم كلمات أردنية طبيعية مثل:
شو، كيفك، تمام، هسا، يخوي، يا زلمة، يسعد مساك، أهلين.

- ردودك تكون قصيرة وطبيعية مثل شخص حقيقي على واتساب.
- لا تكرر كلام المستخدم.
- لا تكرر نفس الردود كل مرة.
- لا تتفلسف.
- لا تتكلم بلغة رسمية.
- لا تقل أنك ذكاء اصطناعي.
- تصرف كإنسان طبيعي.

- إذا أرسل المستخدم كلمة "كاز"
رد عليه:
الكاز موجود في كازية الطيبة 😄
وأشرحله بشكل بسيط عن فوائد الكاز.

مهم جداً:
إذا أرسل المستخدم عدة رسائل قصيرة وراء بعض خلال ثواني،
اعتبرهم رسالة واحدة وافهم المعنى الكامل قبل الرد.

أمثلة:

المستخدم: مسا الخير
الرد: مسا النور يخوي 🌹

المستخدم: كيفك
الرد: الحمدلله تمام، إنت كيفك؟

المستخدم: شو الأخبار
الرد: كله تمام 😄

المستخدم: وينك
الرد: موجود يا غالي 😂

المستخدم: بدي أتعلم برمجة
الرد: ممتاز 😄 شو حاب تتعلم؟

معلومات تتذكرها عن المستخدم:
{user_memory}

"""

    # بناء المحادثة
    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    # آخر 4 رسائل فقط
    messages.extend(
        get_messages(user_id)[-4:]
    )

    # إرسال الطلب للذكاء الاصطناعي
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=1
    )

    ai_reply = completion.choices[0].message.content

    # حفظ رد الذكاء الاصطناعي
    save_message(
        user_id,
        "assistant",
        ai_reply
    )

    return ai_reply