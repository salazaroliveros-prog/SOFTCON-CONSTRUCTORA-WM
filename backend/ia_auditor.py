from backend import models
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

def verificar_desviacion_presupuesto(db: Session, proyecto_id: uuid.UUID):
    """
    Compara el costo teórico (IA) vs el costo real (Facturas/OC)
    """
    # 1. Obtener lo que la IA dijo que costaría el proyecto
    presupuesto_teorico = (
        db.query(
            func.coalesce(
                func.sum(
                    models.PresupuestoRenglon.costo_unitario_ia
                    * models.PresupuestoRenglon.cantidad_total
                ),
                0.0,
            )
        )
        .filter(models.PresupuestoRenglon.proyecto_id == proyecto_id)
        .scalar()
        or 0.0
    )

    try:
        presupuesto_teorico = float(presupuesto_teorico or 0.0)
    except Exception:
        presupuesto_teorico = 0.0

    # 2. Obtener lo que se ha gastado realmente en Órdenes de Compra
    subtotal_expr = func.coalesce(
        models.DetalleOrdenCompra.subtotal,
        models.DetalleOrdenCompra.cantidad_pedida * models.DetalleOrdenCompra.precio_unitario_compra,
    )
    gasto_real = (
        db.query(func.coalesce(func.sum(subtotal_expr), 0.0))
        .join(models.OrdenCompra, models.OrdenCompra.id == models.DetalleOrdenCompra.oc_id)
        .filter(models.OrdenCompra.proyecto_id == proyecto_id)
        .scalar()
        or 0.0
    )

    try:
        gasto_real = float(gasto_real or 0.0)
    except Exception:
        gasto_real = 0.0

    desviacion = 0
    if presupuesto_teorico > 0:
        desviacion = (gasto_real / presupuesto_teorico) * 100

    return {
        "proyecto_id": str(proyecto_id),
        "presupuesto_ia": float(presupuesto_teorico),
        "gasto_real": float(gasto_real),
        "porcentaje_consumido": round(desviacion, 2),
        "alerta_critica": desviacion > 105  # Alerta si nos pasamos del 5%
    }


def obtener_teorico_disponible(db: Session, proyecto_id: uuid.UUID, insumo_id: uuid.UUID) -> float:
    """Calcula: (Suma de Cantidad_Renglones * Rendimiento_APU) - Suma_Ya_Comprada."""

    total_presupuestado = (
        db.query(func.sum(models.PresupuestoRenglon.cantidad_total * models.APUComposicion.rendimiento))
        .join(models.APUComposicion, models.PresupuestoRenglon.id == models.APUComposicion.renglon_id)
        .filter(models.PresupuestoRenglon.proyecto_id == proyecto_id)
        .filter(models.APUComposicion.insumo_id == insumo_id)
        .scalar()
        or 0.0
    )

    total_comprado = (
        db.query(func.sum(models.DetalleOrdenCompra.cantidad_pedida))
        .join(models.OrdenCompra, models.OrdenCompra.id == models.DetalleOrdenCompra.oc_id)
        .filter(models.OrdenCompra.proyecto_id == proyecto_id)
        .filter(models.DetalleOrdenCompra.insumo_id == insumo_id)
        .scalar()
        or 0.0
    )

    return float(total_presupuestado) - float(total_comprado)


def calcular_consumo_materiales_por_avance(
    db: Session, renglon_id: uuid.UUID, cantidad_reportada: float
) -> list[dict[str, float]]:
    """Retorna materiales y cantidad teórica usada según APU.

    Calcula: cantidad_reportada * rendimiento * desperdicio.
    """

    composicion = (
        db.query(models.APUComposicion)
        .filter(models.APUComposicion.renglon_id == renglon_id)
        .all()
    )

    consumo_teorico: list[dict[str, float]] = []
    for item in composicion:
        desperdicio = float(getattr(item, "desperdicio", 1.0) or 1.0)
        cantidad_gastada = float(cantidad_reportada) * float(item.rendimiento) * desperdicio
        consumo_teorico.append(
            {
                "insumo_id": str(item.insumo_id),
                "cantidad_gastada": float(cantidad_gastada),
            }
        )

    return consumo_teorico