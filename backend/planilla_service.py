from __future__ import annotations

import datetime
import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend import models


def calcular_pago_semanal(
    db: Session,
    trabajador_id: uuid.UUID,
    fecha_inicio: datetime.datetime,
    fecha_fin: datetime.datetime,
) -> float:
    trabajador = (
        db.query(models.Trabajador)
        .filter(models.Trabajador.id == trabajador_id)
        .first()
    )
    if trabajador is None:
        raise ValueError("Trabajador no encontrado")

    tarifa_base = getattr(trabajador, "tarifa_base", None)
    tarifa = float(tarifa_base) if tarifa_base is not None else 0.0
    if tarifa <= 0:
        return 0.0

    tipo_pago = str(trabajador.tipo_pago)

    if tipo_pago == "jornal":
        dias_laborados = (
            db.query(models.RegistroAsistencia)
            .filter(models.RegistroAsistencia.trabajador_id == trabajador_id)
            .filter(models.RegistroAsistencia.fecha.between(fecha_inicio, fecha_fin))
            .count()
        )
        return float(dias_laborados) * tarifa

    if tipo_pago == "destajo":
        avance_total = (
            db.query(func.sum(models.ReporteAvance.cantidad_avanzada))
            .filter(models.ReporteAvance.usuario_id == trabajador_id)
            .filter(models.ReporteAvance.fecha_reporte.between(fecha_inicio, fecha_fin))
            .scalar()
            or 0.0
        )
        return float(avance_total) * tarifa

    raise ValueError(f"tipo_pago no soportado: {tipo_pago}")
