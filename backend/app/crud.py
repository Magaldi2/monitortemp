from sqlalchemy.orm import Session
from . import models, schemas

def create_temperature_reading(
    db: Session,
    device_id: str,
    temperature: schemas.TemperatureCreate
) -> models.TemperatureReading:
    """
    Cria uma leitura de temperatura associada a um device_id.
    """
    data = temperature.dict()
    data['device_id'] = device_id
    db_temperature = models.TemperatureReading(**data)
    db.add(db_temperature)
    db.commit()
    db.refresh(db_temperature)
    return db_temperature

def get_temperature_readings(
    db: Session,
    device_id: str,
    skip: int = 0,
    limit: int = 100
) -> list[models.TemperatureReading]:
    """
    Retorna leituras de um dispositivo, ordenadas por data ascendente,
    com paginação via skip/limit.
    """
    return (
        db.query(models.TemperatureReading)
          .filter(models.TemperatureReading.device_id == device_id)
          .order_by(models.TemperatureReading.created_at.asc())
          .offset(skip)
          .limit(limit)
          .all()
    )

def get_latest_temperature(
    db: Session,
    device_id: str
) -> models.TemperatureReading | None:
    """
    Retorna a última leitura de temperatura de um dispositivo.
    """
    return (
        db.query(models.TemperatureReading)
          .filter(models.TemperatureReading.device_id == device_id)
          .order_by(models.TemperatureReading.created_at.desc())
          .first()
    )
