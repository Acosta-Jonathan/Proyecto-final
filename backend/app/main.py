from datetime import timedelta, datetime
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, SessionLocal, engine
from app.models import Cancha, Reservacion
from app.schemas.reservacion import ReservacionConId, ReservacionCreate as ReservacionSchema
from app.schemas.cancha import CanchaConId, CanchaCreate as CanchaSchema

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------- ENDPOINTS DE CANCHAS --------------------

# Endpoint para crear una nueva cancha
@app.post("/canchas/", response_model=CanchaConId)
def create_cancha(cancha: CanchaSchema, db: Session = Depends(get_db)):
    db_cancha = Cancha(nombre=cancha.nombre, techada=cancha.techada)
    db.add(db_cancha)
    db.commit()
    db.refresh(db_cancha)
    return db_cancha

# Endpoint para obtener todas las reservas de la cancha seleccionada
@app.get("/canchas/{cancha_id}/reservas", response_model=list[ReservacionConId])
def get_reservas_por_cancha(cancha_id: int, db: Session = Depends(get_db)):
    reservas = db.query(Reservacion).filter(
        Reservacion.cancha_id == cancha_id
    ).order_by(Reservacion.fecha, Reservacion.hora_inicio).all()
    # Convertir los campos de las reservas al formato esperado por el frontend
    reservas_respuesta = [
        {
            "id": r.id,
            "cancha_id": r.cancha_id,
            "fecha": r.fecha.strftime("%Y-%m-%d"),  # Convertir fecha al formato "YYYY-MM-DD"
            "hora_inicio": r.hora_inicio.strftime("%H:%M"),  # Convertir hora_inicio al formato "HH:MM"
            "duracion": r.duracion,
            "nombre_contacto": r.nombre_contacto,
            "telefono_area": r.telefono_area,
            "telefono_numero": r.telefono_numero
        }
        for r in reservas
    ]
    return reservas_respuesta

# Endpoint para obtener todas las canchas
@app.get("/canchas/", response_model=list[CanchaConId])
def get_canchas(db: Session = Depends(get_db)):
    return db.query(Cancha).all()

# Endpoint para obtener una cancha por ID
@app.get("/canchas/{cancha_id}", response_model=CanchaSchema)
def get_cancha(cancha_id: int, db: Session = Depends(get_db)):
    db_cancha = db.query(Cancha).filter(Cancha.id == cancha_id).first()
    if db_cancha is None:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return db_cancha

# Endpoint para actualizar una cancha
@app.put("/canchas/{cancha_id}", response_model=CanchaConId)
def update_cancha(cancha_id: int, cancha: CanchaSchema, db: Session = Depends(get_db)):
    db_cancha = db.query(Cancha).filter(Cancha.id == cancha_id).first()
    if db_cancha is None:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    
    db_cancha.nombre = cancha.nombre
    db_cancha.techada = cancha.techada
    db.commit()
    db.refresh(db_cancha)
    return db_cancha

# Endpoint para eliminar una cancha
@app.delete("/canchas/{cancha_id}")
def delete_cancha(cancha_id: int, db: Session = Depends(get_db)):
    db_cancha = db.query(Cancha).filter(Cancha.id == cancha_id).first()
    if db_cancha is None:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    
    db.delete(db_cancha)
    db.commit()
    return {"message": "Cancha eliminada"}

# -------------------- ENDPOINTS DE RESERVACIONES --------------------

# Endpoint para crear una nueva reservación
@app.post("/reservaciones/")
def create_reservacion(reservacion: ReservacionSchema, db: Session = Depends(get_db)):
    # Convertir fecha y hora a objetos datetime
    try:
        fecha_obj = datetime.strptime(reservacion.fecha, "%Y-%m-%d").date()
        print(f"Fecha convertida: {fecha_obj}")

        # Convertir hora de inicio
        hora_inicio_obj = datetime.strptime(str(reservacion.hora_inicio), "%H:%M").time()
        print(f"Hora de inicio convertida: {hora_inicio_obj}")

        # Combinar fecha y hora de inicio
        hora_inicio_datetime = datetime.combine(fecha_obj, hora_inicio_obj)
        print(f"Hora de inicio combinada: {hora_inicio_datetime}")

        # Calcular hora de fin
        hora_fin_datetime = hora_inicio_datetime + timedelta(minutes=reservacion.duracion)
        print(f"Hora de fin calculada: {hora_fin_datetime}")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha o hora inválido")
    
    # Consultar las reservas del día anterior, el mismo día y el día siguiente
    reservas_existentes = db.query(Reservacion).filter(
        Reservacion.cancha_id == reservacion.cancha_id,  # Misma cancha
        or_(
            Reservacion.fecha == fecha_obj - timedelta(days=1),  # Día anterior
            Reservacion.fecha == fecha_obj,                      # Mismo día
            Reservacion.fecha == fecha_obj + timedelta(days=1),  # Día siguiente
        )
    ).all()
    
    # Comprobar superposición con las reservas existentes
    for existente in reservas_existentes:
        existente_inicio = datetime.combine(existente.fecha, existente.hora_inicio)
        existente_fin = existente_inicio + timedelta(minutes=existente.duracion)
        
        if (hora_inicio_datetime < existente_fin) and (hora_fin_datetime > existente_inicio):
            raise HTTPException(status_code=400, detail="La reserva se superpone con otra existente")
    
    # Crear y guardar la reserva si no hay superposición
    nueva_reserva = Reservacion(
        cancha_id=reservacion.cancha_id,
        fecha=fecha_obj,
        hora_inicio=hora_inicio_obj,
        duracion=reservacion.duracion,
        nombre_contacto=reservacion.nombre_contacto,
        telefono_area=reservacion.telefono_area,
        telefono_numero=reservacion.telefono_numero
    )
    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)



# Endpoint para obtener todas las reservaciones
@app.get("/reservaciones/", response_model=list[ReservacionSchema])
def get_reservaciones(db: Session = Depends(get_db)):
    # Obtener todas las reservas
    reservaciones = db.query(Reservacion).all()

    # Convertir los campos fecha y hora_inicio a cadenas
    reservaciones_respuesta = [
        {
            "id": r.id,
            "cancha_id": r.cancha_id,
            "fecha": r.fecha.strftime("%Y-%m-%d"),
            "hora_inicio": r.hora_inicio.strftime("%H:%M"),
            "duracion": r.duracion,
            "nombre_contacto": r.nombre_contacto,
            "telefono_area": r.telefono_area,
            "telefono_numero": r.telefono_numero
        }
        for r in reservaciones
    ]

    return JSONResponse(content=reservaciones_respuesta)

# Endpoint para obtener una reservación por ID
@app.get("/reservaciones/{reservacion_id}", response_model=ReservacionSchema)
def get_reservacion(reservacion_id: int, db: Session = Depends(get_db)):
    reservacion = db.query(Reservacion).filter(Reservacion.id == reservacion_id).first()
    if not reservacion:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    
    # Formatear la respuesta
    return {
        "id": reservacion.id,
        "cancha_id": reservacion.cancha_id,
        "fecha": reservacion.fecha.strftime("%Y-%m-%d"),
        "hora_inicio": reservacion.hora_inicio.strftime("%H:%M"),
        "duracion": reservacion.duracion,
        "nombre_contacto": reservacion.nombre_contacto,
        "telefono_area": reservacion.telefono_area,
        "telefono_numero": reservacion.telefono_numero
    }

# Endpoint para actualizar una reservación
@app.put("/reservaciones/{reservacion_id}", response_model=ReservacionConId)
def update_reservacion(reservacion_id: int, reservacion: ReservacionSchema, db: Session = Depends(get_db)):
    db_reservacion = db.query(Reservacion).filter(Reservacion.id == reservacion_id).first()
    if not db_reservacion:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")

    # Convertir fecha y hora a objetos datetime
    try:
        fecha_obj = datetime.strptime(reservacion.fecha, "%Y-%m-%d").date()

        # Convertir hora de inicio
        hora_inicio_obj = datetime.strptime(str(reservacion.hora_inicio), "%H:%M").time()
        # Combinar fecha y hora de inicio
        hora_inicio_datetime = datetime.combine(fecha_obj, hora_inicio_obj)
        # Calcular hora de fin
        hora_fin_datetime = hora_inicio_datetime + timedelta(minutes=reservacion.duracion)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha o hora inválido")
    
    # Consultar las reservas del día anterior, el mismo día y el día siguiente
    reservas_existentes = db.query(Reservacion).filter(
        Reservacion.id != reservacion_id,
        Reservacion.cancha_id == reservacion.cancha_id,  # Misma cancha
        or_(
            Reservacion.fecha == fecha_obj - timedelta(days=1),  # Día anterior
            Reservacion.fecha == fecha_obj,                      # Mismo día
            Reservacion.fecha == fecha_obj + timedelta(days=1),  # Día siguiente
        )
    ).all()
    
    # Comprobar superposición con las reservas existentes
    for existente in reservas_existentes:
        existente_inicio = datetime.combine(existente.fecha, existente.hora_inicio)
        existente_fin = existente_inicio + timedelta(minutes=existente.duracion)
        
        if (hora_inicio_datetime < existente_fin) and (hora_fin_datetime > existente_inicio):
            raise HTTPException(status_code=400, detail="La reserva se superpone con otra existente")
    
    
    
    db_reservacion.cancha_id = reservacion.cancha_id
    db_reservacion.fecha = fecha_obj
    db_reservacion.hora_inicio = hora_inicio_obj
    db_reservacion.duracion = reservacion.duracion
    db_reservacion.nombre_contacto = reservacion.nombre_contacto
    db_reservacion.telefono_area=reservacion.telefono_area,
    db_reservacion.telefono_numero=reservacion.telefono_numero

    db.commit()
    db.refresh(db_reservacion)

    
    # Formatear la respuesta
    return {
        "id": db_reservacion.id,
        "cancha_id": db_reservacion.cancha_id,
        "fecha": db_reservacion.fecha.strftime("%Y-%m-%d"),
        "hora_inicio": db_reservacion.hora_inicio.strftime("%H:%M"),
        "duracion": db_reservacion.duracion,
        "nombre_contacto": db_reservacion.nombre_contacto,
        "telefono_area": reservacion.telefono_area,
        "telefono_numero": reservacion.telefono_numero
    }

# Endpoint para eliminar una reservación
@app.delete("/reservaciones/{id}")
def eliminar_reservacion(id: int, db: Session = Depends(get_db)):
    reservacion = db.query(Reservacion).filter(Reservacion.id == id).first()
    if not reservacion:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    db.delete(reservacion)
    db.commit()
    return {"mensaje": "Reservación eliminada"}


@app.get("/reservaciones/por_cancha_y_fecha/", response_model=list[ReservacionConId])
def get_reservas_por_cancha_y_fecha(
    cancha_id: int,
    fecha: str = Query(..., regex="^\d{4}-\d{2}-\d{2}$"),  # Validación del formato de fecha
    db: Session = Depends(get_db),
):
    """
    Obtiene las reservas de una cancha específica para una fecha dada.
    :param cancha_id: ID de la cancha
    :param fecha: Fecha en formato "YYYY-MM-DD"
    """
    try:
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD.")

    reservas = db.query(Reservacion).filter(
        Reservacion.cancha_id == cancha_id,
        Reservacion.fecha == fecha_obj
    ).order_by(Reservacion.hora_inicio).all()

    if not reservas:
        raise HTTPException(status_code=404, detail="No se encontraron reservas para la fecha y cancha dadas.")

    # Formatear la respuesta para el frontend
    reservas_respuesta = [
        {
            "id": r.id,
            "cancha_id": r.cancha_id,
            "fecha": r.fecha.strftime("%Y-%m-%d"),
            "hora_inicio": r.hora_inicio.strftime("%H:%M"),
            "duracion": r.duracion,
            "nombre_contacto": r.nombre_contacto,
            "telefono_area": r.telefono_area,
            "telefono_numero": r.telefono_numero
        }
        for r in reservas
    ]

    return reservas_respuesta