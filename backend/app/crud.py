from sqlalchemy.orm import Session
from . import models, schemas

def create_temperature_reading(db: Session, temperature: schemas.TemperatureCreate):
    db_temperature = models.TemperatureReading(**temperature.dict())
    db.add(db_temperature)
    db.commit()
    db.refresh(db_temperature)
    return db_temperature

def get_temperature_readings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.TemperatureReading).offset(skip).limit(limit).all()