from pydantic import BaseModel

class ReservacionBase(BaseModel):
    cancha_id: int
    fecha: str
    hora_inicio: str
    duracion: int
    nombre_contacto: str
    telefono_contacto: str

class ReservacionCreate(ReservacionBase):
    pass

class ReservacionConId(ReservacionBase):
    id: int
    
    class Config:
        from_attributes = True
