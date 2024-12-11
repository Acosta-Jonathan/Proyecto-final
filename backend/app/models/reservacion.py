# backend/app/models/reservacion.py
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import Mapped, relationship, mapped_column
from app.database import Base

class Reservacion(Base):
    __tablename__ = "reservaciones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cancha_id: Mapped[int] = mapped_column(Integer, ForeignKey("canchas.id"), nullable=False)
    fecha: Mapped[Date] = mapped_column(Date, nullable=False)
    hora_inicio: Mapped[Time] = mapped_column(Time, nullable=False)
    duracion: Mapped[int] = mapped_column(Integer, nullable=False)
    nombre_contacto: Mapped[str] = mapped_column(String, nullable=False)
    telefono_contacto: Mapped[str] = mapped_column(String, nullable=False)

    # Relación con la tabla `cancha`
    cancha: Mapped["Cancha"] = relationship("Cancha", back_populates="reservaciones")

    def __init__(self, cancha_id: int, fecha: Date, hora_inicio: Time, duracion: int, nombre_contacto: str, telefono_contacto: str):
        self.cancha_id = cancha_id
        self.fecha = fecha
        self.hora_inicio = hora_inicio
        self.duracion = duracion
        self.nombre_contacto = nombre_contacto
        self.telefono_contacto = telefono_contacto

    class Config:
        from_attributes = True
