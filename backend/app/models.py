from sqlalchemy import Column, Integer, String, DateTime , Float
from sqlalchemy.sql import func
from .database import Base

class TemperatureReading(Base):
    __tablename__ = "temperature_readings"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EmailRecipient(Base):
    __tablename__ = "email_recipients"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

