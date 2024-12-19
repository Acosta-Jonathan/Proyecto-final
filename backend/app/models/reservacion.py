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
    telefono_area: Mapped[str] = mapped_column(String(4), nullable=False)
    telefono_numero: Mapped[str] = mapped_column(String(8), nullable=False)

    # Relación con la tabla `cancha`
    cancha: Mapped["Cancha"] = relationship("Cancha", back_populates="reservaciones")


    class Config:
        from_attributes = True
