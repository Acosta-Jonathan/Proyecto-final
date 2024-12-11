from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import Mapped, relationship, mapped_column
from app.database import Base

class Cancha(Base):
    __tablename__ = "canchas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    techada: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relación con la tabla `reservaciones`
    reservaciones: Mapped[list["Reservacion"]] = relationship("Reservacion", back_populates="cancha")

    def __init__(self, nombre: str, techada: bool = False):
        self.nombre = nombre
        self.techada = techada

    class Config:
        from_attributes = True
