from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func
from .database import Base

class TemperatureReading(Base):
    __tablename__ = "temperature_readings"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())