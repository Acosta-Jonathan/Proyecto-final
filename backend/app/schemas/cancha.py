from pydantic import BaseModel

class CanchaBase(BaseModel):
    nombre: str
    techada: bool = False

class CanchaCreate(CanchaBase):
    pass

class CanchaConId(CanchaBase):
    id: int

    class Config:
        from_attributes = True
