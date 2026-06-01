from sqlalchemy import Column, Integer, Text

from app.core.database import Base


class RideNotification(Base):

    __tablename__ = "ride_notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ride_id = Column(
        Integer
    )

    driver_number = Column(
        Text
    )