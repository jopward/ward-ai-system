import sqlite3

conn = sqlite3.connect(
    "/root/ward-ai-system/ward_ai.db"
)

cursor = conn.cursor()

# حذف الرحلات
cursor.execute(
    "DELETE FROM rides"
)

# حذف إشعارات الرحلات
cursor.execute(
    "DELETE FROM ride_notifications"
)

# حذف ذاكرة المحادثات
cursor.execute(
    "DELETE FROM conversations"
)

conn.commit()
conn.close()

print("DATABASE CLEANED")