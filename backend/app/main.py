from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud
from app.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuração CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/temperature/", response_model=schemas.Temperature)
def create_temperature(temperature: schemas.TemperatureCreate, db: Session = Depends(get_db)):
    return crud.create_temperature_reading(db, temperature=temperature)

@app.get("/api/temperature/", response_model=list[schemas.Temperature])
def read_temperatures(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    temperatures = crud.get_temperature_readings(db, skip=skip, limit=limit)
    return temperatures

@app.get("/api/temperature/latest/", response_model=schemas.Temperature)
def read_latest_temperature(db: Session = Depends(get_db)):
    temperature = db.query(models.TemperatureReading).order_by(models.TemperatureReading.created_at.desc()).first()
    if temperature is None:
        raise HTTPException(status_code=404, detail="No temperature readings found")
    return temperature