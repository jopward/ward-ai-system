from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime
)

from datetime import datetime

from app.core.database import Base


class Conversation(Base):

    __tablename__ = "conversations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(Text)

    role = Column(Text)
    content = Column(Text)
    memory = Column(Text, default="")

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )