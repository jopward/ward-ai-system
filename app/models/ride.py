from sqlalchemy import Column, Integer, Text, DateTime, String
from datetime import datetime
from sqlalchemy import Boolean

from app.core.database import Base


class Ride(Base):

    __tablename__ = "rides"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_number = Column(Text)

    message = Column(Text)

    pickup = Column(Text)

    destination = Column(Text)

    group_id = Column(Text)

    message_id = Column(Text)

    status = Column(Text)
    confirmation_status = Column(
    Text,
    default="NEW"
    )

    driver_number = Column(Text)



    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    published_to_drivers = Column(
        Boolean,
        default=False
    )
    