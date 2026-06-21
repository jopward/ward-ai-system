from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True)
    phone = Column(String, unique=True)
    name = Column(String)
    active = Column(Integer, default=1)