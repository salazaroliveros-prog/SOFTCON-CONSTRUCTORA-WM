from __future__ import annotations

import uuid
from typing import Any
import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend import models


def calcular_estado_financiero_proyecto(db: Session, proyecto_id: uuid.UUID) -> dict[str, Any]:
    proyecto = db.get(models.Proyecto, proyecto_id)

    ingresos = (
        db.query(func.sum(models.IngresoProyecto.monto))
        .filter(models.IngresoProyecto.proyecto_id == proyecto_id)
        .scalar()
        or 0.0
    )

    materiales = (
        db.query(func.sum(models.DetalleOrdenCompra.subtotal))
        .join(
            models.OrdenCompra,
            models.DetalleOrdenCompra.oc_id == models.OrdenCompra.id,
        )
        .filter(models.OrdenCompra.proyecto_id == proyecto_id)
        .filter(models.OrdenCompra.estado == "entregada")
        .scalar()
        or 0.0
    )

    planilla = (
        db.query(func.sum(models.PagoPlanilla.monto_total))
        .filter(models.PagoPlanilla.proyecto_id == proyecto_id)
        .filter(models.PagoPlanilla.estado == "pagado")
        .scalar()
        or 0.0
    )

    ingresos_f = float(ingresos)
    materiales_f = float(materiales)
    planilla_f = float(planilla)

    egresos_totales = materiales_f + planilla_f
    utilidad = ingresos_f - egresos_totales
    margen = (utilidad / ingresos_f * 100.0) if ingresos_f > 0 else 0.0

    return {
        "proyecto_id": str(proyecto_id),
        "nombre_proyecto": getattr(proyecto, "nombre_proyecto", None),
        "ingresos": ingresos_f,
        "egresos_materiales": materiales_f,
        "egresos_planilla": planilla_f,
        "egresos_totales": egresos_totales,
        "utilidad_neta": utilidad,
        "margen_utilidad": round(margen, 2),
    }


def calcular_balance_vida_negocio(db: Session, usuario_id: uuid.UUID) -> dict[str, Any]:
    # 1) Utilidad neta total (última foto por proyecto para no sumar histórico)
    latest_por_proyecto = (
        db.query(
            models.FlujoCajaConsolidado.proyecto_id.label("proyecto_id"),
            func.max(models.FlujoCajaConsolidado.fecha_corte).label("max_fecha"),
        )
        .group_by(models.FlujoCajaConsolidado.proyecto_id)
        .subquery()
    )

    utilidad_proyectos = (
        db.query(func.sum(models.FlujoCajaConsolidado.utilidad_bruta))
        .join(
            latest_por_proyecto,
            (models.FlujoCajaConsolidado.proyecto_id == latest_por_proyecto.c.proyecto_id)
            & (models.FlujoCajaConsolidado.fecha_corte == latest_por_proyecto.c.max_fecha),
        )
        .scalar()
        or 0.0
    )

    utilidad_proyectos_f = float(utilidad_proyectos)

    # 2) Configuración de retiro del usuario
    config = (
        db.query(models.ConfiguracionRetiro)
        .filter(models.ConfiguracionRetiro.usuario_id == usuario_id)
        .first()
    )

    ingreso_personal = 0.0
    if config is not None:
        tipo = (getattr(config, "tipo_retiro", "") or "").strip().lower()
        valor = float(getattr(config, "valor", 0.0) or 0.0)
        if tipo == "porcentaje":
            ingreso_personal = utilidad_proyectos_f * (valor / 100.0)
        elif tipo == "fijo":
            ingreso_personal = valor
        else:
            ingreso_personal = valor

    # 3) Gastos personales del mes actual (por mes y año)
    now = datetime.datetime.now()
    gastos_mes = (
        db.query(func.sum(models.GastoPersonal.monto))
        .filter(models.GastoPersonal.usuario_id == usuario_id)
        .filter(func.extract("month", models.GastoPersonal.fecha) == now.month)
        .filter(func.extract("year", models.GastoPersonal.fecha) == now.year)
        .scalar()
        or 0.0
    )

    gastos_mes_f = float(gastos_mes)
    ahorro = float(ingreso_personal) - gastos_mes_f

    return {
        "usuario_id": str(usuario_id),
        "utilidad_proyectos": utilidad_proyectos_f,
        "ingreso_disponible_empresa": float(ingreso_personal),
        "gastos_personales_totales": gastos_mes_f,
        "ahorro_neto_del_mes": ahorro,
        "salud_financiera": "Estable" if float(ingreso_personal) > gastos_mes_f else "Crítica",
    }
