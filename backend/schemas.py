from __future__ import annotations

import uuid
from typing import List
import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class InsumoBase(BaseModel):
    nombre: str
    tipo: str
    unidad: str
    rendimiento: float
    precio_guate: float


class APUResponse(BaseModel):
    descripcion_renglon: str
    unidad_medida: str
    cantidad: float
    insumos: List[InsumoBase]

    model_config = ConfigDict(from_attributes=True)


class ItemCompra(BaseModel):
    insumo_id: uuid.UUID
    cantidad: float = Field(gt=0)
    precio_pactado: float = Field(ge=0)


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=6, max_length=128)
    rol: str = Field(default="trabajador", max_length=20)


class AsistenciaGPSRequest(BaseModel):
    trabajador_id: uuid.UUID
    latitud: float
    longitud: float
    fecha: datetime.datetime


class OrdenCompraEstadoUpdate(BaseModel):
    estado: str = Field(min_length=1, max_length=30)


class GastoPersonalCreate(BaseModel):
    descripcion: str = Field(min_length=1, max_length=200, validation_alias=AliasChoices("descripcion", "desc"))
    monto: float = Field(gt=0)
    categoria: str = Field(
        default="Hogar",
        min_length=1,
        max_length=50,
        validation_alias=AliasChoices("categoria", "cat"),
    )
    fecha: datetime.datetime | None = None


class GastoCreate(BaseModel):
    desc: str = Field(min_length=1, max_length=200)
    monto: float = Field(gt=0)
    cat: str = Field(min_length=1, max_length=50)


class Proyecto(BaseModel):
    id: uuid.UUID
    nombre_proyecto: str
    departamento: str | None = None
    presupuesto_total: float = 0.0

    model_config = ConfigDict(from_attributes=True)
