from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud
from app.database import SessionLocal, engine
from datetime import datetime
from pydantic import BaseModel

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get ("/")
def home():
    return{"message": "API FUNCIONA"}

@app.get("/api/temperature/", response_model=list[schemas.Temperature])
def read_temperatures(db: Session = Depends(get_db)):
    temperatures = db.query(models.TemperatureReading)\
                   .order_by(models.TemperatureReading.created_at.asc())\
                   .limit(20)\
                   .all()
    return temperatures


@app.get("/api/temperature/latest/", response_model=schemas.Temperature)
def read_latest_temperature(db: Session = Depends(get_db)):
    temperature = db.query(models.TemperatureReading).order_by(models.TemperatureReading.created_at.desc()).first()
    if not temperature:
        raise HTTPException(status_code=404, detail="No readings found")
    return temperature

@app.post("/api/temperature/", response_model=schemas.Temperature)
def create_temperature(temperature: schemas.TemperatureCreate, db: Session = Depends(get_db)):

    db_temperature = models.TemperatureReading(
        temperature=temperature.temperature,
        created_at=datetime.now()
    )
    db.add(db_temperature)
    db.commit()
    db.refresh(db_temperature)
    return db_temperature

@app.delete("/api/temperature/clear")
def clear_temperatures(db: Session = Depends(get_db)):
    try:
        num_deleted = db.query(models.TemperatureReading).delete()
        db.commit()
        return {"message": f"{num_deleted} leituras removidas"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Alert Management
class AlertTemperature(BaseModel):
    temperature: float

current_alert_temp = 30.0  # Valor padrão

@app.post("/api/alert-temperature/")
async def set_alert_temperature(temp: AlertTemperature, db: Session = Depends(get_db)):
    global current_alert_temp
    current_alert_temp = temp.temperature
    return {"message": f"Alerta configurado para {current_alert_temp}°C"}

@app.get("/api/alert-temperature/")
async def get_alert_temperature():
    return {"alert_temperature": current_alert_temp}


# Email Management
@app.post("/api/emails/", response_model=schemas.EmailRecipient)
def add_email(recipient: schemas.EmailRecipientCreate, db: Session = Depends(get_db)):
    db_email = models.EmailRecipient(email=recipient.email)
    db.add(db_email)
    db.commit()
    db.refresh(db_email)
    return db_email

@app.get("/api/emails/", response_model=list[schemas.EmailRecipient])
def list_emails(db: Session = Depends(get_db)):
    return db.query(models.EmailRecipient).all()

@app.delete("/api/emails/{email_id}")
def delete_email(email_id: int, db: Session = Depends(get_db)):
    email = db.query(models.EmailRecipient).filter(models.EmailRecipient.id == email_id).first()
    if email is None:
        raise HTTPException(status_code=404, detail="Email not found")
    db.delete(email)
    db.commit()
    return {"message": "Email deleted"}

@app.get("/api/emails/addresses/", response_model=list[str])
def list_email_addresses(db: Session = Depends(get_db)):
    return [e.email for e in db.query(models.EmailRecipient).all()]