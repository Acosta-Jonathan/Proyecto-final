from datetime import date, datetime, time
from pydantic import BaseModel, root_validator, ValidationError

class ReservacionBase(BaseModel):
    cancha_id: int
    fecha: date
    hora_inicio: time
    duracion: int
    nombre_contacto: str
    telefono_contacto: str

class ReservacionCreate(ReservacionBase):
    pass

class ReservacionConId(ReservacionBase):
    id: int
    
    class Config:
        from_attributes = True
