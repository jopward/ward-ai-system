from sqlalchemy import Column, Integer, Text

from app.core.database import Base


class DriverInterest(Base):

    __tablename__ = "driver_interests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    driver_number = Column(
        Text
    )

    keyword = Column(
        Text
    )