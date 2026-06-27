from sqlalchemy import Column, Integer, Text, Boolean, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class Sensor(Base):

    __tablename__ = "sensors"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    owner_number = Column(
        Text
    )

    sensor_number = Column(
        Text
    )

    session_id = Column(
        Text
    )

    status = Column(
        Text,
        default="WAITING"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    last_seen = Column(
        DateTime(timezone=True)
    )