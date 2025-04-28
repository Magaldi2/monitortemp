from pydantic import BaseModel
from datetime import datetime

class TemperatureBase(BaseModel):
    temperature: float

class TemperatureCreate(TemperatureBase):
    pass  # Pode adicionar validações extras se necessário

class Temperature(TemperatureBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True