from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains

import time

from app.services.ai_service import get_ai_reply

# =========================================
# إعدادات Chrome
# =========================================

options = Options()

options.add_argument(
    r"--user-data-dir=E:\WARD_PROJECTS\automation\chrome_profile"
)

options.add_argument(
    "--disable-blink-features=AutomationControlled"
)

# =========================================
# chromedriver
# =========================================

service = Service(
    r"chromedriver-win64\chromedriver.exe"
)

# =========================================
# تشغيل المتصفح
# =========================================

driver = webdriver.Chrome(
    service=service,
    options=options
)

actions = ActionChains(driver)

# =========================================
# فتح Messenger
# =========================================

driver.get(
    "https://www.facebook.com/messages"
)

print("⏳ انتظار تحميل Messenger...")

time.sleep(15)

print("✅ البوت يعمل")

# =========================================
# الرسائل التي تم الرد عليها
# =========================================

processed_messages = set()

# =========================================
# حلقة البوت
# =========================================

while True:

    try:

        print("👀 فحص الرسائل الجديدة...")

        # =========================================
        # جلب كل المحادثات
        # =========================================

        chats = driver.find_elements(
            By.XPATH,
            "//a[contains(@href,'/messages/t/')]"
        )

        print("📨 عدد المحادثات:", len(chats))

        target_chat = None

        # =========================================
        # البحث عن نقطة زرقاء
        # =========================================

        for chat in chats:

            try:

                # المحادثة الجديدة تحتوي نقطة زرقاء
                blue_dot = chat.find_elements(
                    By.XPATH,
                    ".//div[contains(@style,'rgb(0, 132, 255)')]"
                )

                if len(blue_dot) > 0:

                    target_chat = chat
                    break

            except:
                pass

        # =========================================
        # إذا لا يوجد رسائل جديدة
        # =========================================

        if target_chat is None:

            print("📭 لا يوجد رسائل جديدة")

            time.sleep(5)
            continue

        # =========================================
        # فتح المحادثة
        # =========================================

        driver.execute_script(
            "arguments[0].scrollIntoView();",
            target_chat
        )

        time.sleep(1)

        driver.execute_script(
            "arguments[0].click();",
            target_chat
        )

        print("📂 تم فتح المحادثة")

        time.sleep(3)

        # =========================================
        # اسم المستخدم
        # =========================================

        try:

            user_name = driver.find_element(
                By.XPATH,
                "//h2"
            ).text.strip()

        except:

            user_name = "facebook_user"

        print("👤 المستخدم:")
        print(user_name)

        # =========================================
        # قراءة الرسائل
        # =========================================

        message_elements = driver.find_elements(
            By.XPATH,
            "//span[@dir='auto']"
        )

        messages = []

        for element in message_elements:

            try:

                text = element.text.strip()

                if text != "":

                    messages.append(text)

            except:
                pass

        print("📨 عدد الرسائل:", len(messages))

        # =========================================
        # إذا لا يوجد رسائل
        # =========================================

        if len(messages) == 0:

            time.sleep(5)
            continue

        # =========================================
        # آخر رسالة
        # =========================================

        last_message = messages[-1]

        print("📩 آخر رسالة:")
        print(last_message)

        # =========================================
        # منع التكرار
        # =========================================

        message_key = (
            user_name + ":" + last_message
        )

        if message_key in processed_messages:

            print("⚠️ تم الرد سابقاً")

            time.sleep(5)
            continue

        # =========================================
        # حفظ الرسالة
        # =========================================

        processed_messages.add(
            message_key
        )

        # =========================================
        # توليد الرد
        # =========================================

        ai_reply = get_ai_reply(
            user_name,
            last_message
        )

        print("🤖 الرد:")
        print(ai_reply)

        # =========================================
        # صندوق الكتابة
        # =========================================

        textbox = None

        textboxes = driver.find_elements(
            By.XPATH,
            "//div[@role='textbox']"
        )

        for box in textboxes:

            try:

                if box.is_displayed():

                    textbox = box
                    break

            except:
                pass

        # =========================================
        # إذا لم يجد الصندوق
        # =========================================

        if textbox is None:

            print("❌ لم يتم العثور على صندوق الكتابة")

            time.sleep(5)
            continue

        # =========================================
        # كتابة الرد
        # =========================================

        textbox.click()

        time.sleep(1)

        textbox.send_keys(ai_reply)

        time.sleep(1)

        textbox.send_keys(Keys.ENTER)

        print("✅ تم إرسال الرد")

        time.sleep(5)

    except Exception as e:

        print("❌ خطأ:")
        print(e)

        time.sleep(5)

