from sqlalchemy import Column, Float, DateTime, Integer  
from sqlalchemy.sql import func
from .database import Base

class TemperatureReading(Base):
    __tablename__ = "temperature_readings"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())