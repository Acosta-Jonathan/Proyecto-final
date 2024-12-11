from datetime import timedelta, datetime
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
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

# Endpoint para obtener todas las canchas
@app.get("/canchas/", response_model=list[CanchaSchema])
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
@app.post("/reservaciones/", response_model=ReservacionConId)
async def create_reservacion(reservacion: ReservacionSchema, db: Session = Depends(get_db)):
    # Verifica si la cancha con el id dado existe
    db_cancha = db.query(Cancha).filter(Cancha.id == reservacion.cancha_id).first()
    if db_cancha is None:
        raise HTTPException(status_code=404, detail="La cancha con el id proporcionado no existe")
    
    fecha = reservacion.fecha
    hora_inicio = reservacion.hora_inicio
    
    # Compara si ya existe una reservación en ese tiempo
    existing_reservation = db.query(Reservacion).filter(
        Reservacion.fecha == fecha,
        Reservacion.hora_inicio == hora_inicio
    ).first()

    if existing_reservation:
        raise HTTPException(status_code=400, detail="La reservación ya existe en ese horario")
    # Convertir la fecha y hora a objetos datetime.date y datetime.time
    try:
        fecha_obj = datetime.strptime(reservacion.fecha, "%Y-%m-%d").date()
        hora_inicio_obj = datetime.strptime(str(reservacion.hora_inicio), "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha o hora inválido")
    # Agrega la nueva reservación
    new_reservation = Reservacion(
        fecha=fecha,  # Guardamos el objeto date
        hora_inicio=hora_inicio,  # Guardamos el objeto time
        cancha_id=reservacion.cancha_id,
        nombre_contacto=reservacion.nombre_contacto,
        telefono_contacto=reservacion.telefono_contacto,
        duracion=reservacion.duracion
    )
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    return new_reservation

# Endpoint para obtener todas las reservaciones
@app.get("/reservaciones/", response_model=list[ReservacionConId])
def get_reservaciones(db: Session = Depends(get_db)):
    return db.query(Reservacion).all()

# Endpoint para obtener una reservación por ID
@app.get("/reservaciones/{reservacion_id}", response_model=ReservacionSchema)
def get_reservacion(reservacion_id: int, db: Session = Depends(get_db)):
    db_reservacion = db.query(Reservacion).filter(Reservacion.id == reservacion_id).first()
    if db_reservacion is None:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    return db_reservacion

# Endpoint para actualizar una reservación
@app.put("/reservaciones/{reservacion_id}", response_model=ReservacionSchema)
def update_reservacion(reservacion_id: int, reservacion: ReservacionSchema, db: Session = Depends(get_db)):
    db_reservacion = db.query(Reservacion).filter(Reservacion.id == reservacion_id).first()
    # Convertir la fecha y hora a objetos datetime.date y datetime.time
    try:
        fecha_obj = datetime.strptime(reservacion.fecha, "%Y-%m-%d").date()
        hora_inicio_obj = datetime.strptime(str(reservacion.hora_inicio), "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha o hora inválido")
    
    
    db_reservacion.cancha_id = reservacion.cancha_id
    db_reservacion.fecha = fecha_obj
    db_reservacion.hora_inicio = reservacion.hora_inicio
    db_reservacion.duracion = hora_inicio_obj
    db_reservacion.nombre_contacto = reservacion.nombre_contacto
    db_reservacion.telefono_contacto = reservacion.telefono_contacto
    db.commit()
    db.refresh(db_reservacion)
    return db_reservacion

# Endpoint para eliminar una reservación
@app.delete("/reservaciones/{id}")
def eliminar_reservacion(id: int, db: Session = Depends(get_db)):
    reservacion = db.query(Reservacion).filter(Reservacion.id == id).first()
    if not reservacion:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    db.delete(reservacion)
    db.commit()
    return {"mensaje": "Reservación eliminada"}
