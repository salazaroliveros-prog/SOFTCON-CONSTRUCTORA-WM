from __future__ import annotations

import datetime
import uuid
from typing import Any

from sqlalchemy.orm import Session

from backend import models


def crear_renglon_y_composicion_desde_apu_json(
    db: Session,
    *,
    proyecto_id: uuid.UUID,
    nombre_renglon: str,
    cantidad_total: float,
    apu: dict[str, Any],
    desperdicio_default: float = 1.05,
) -> tuple[models.PresupuestoRenglon, list[models.APUComposicion]]:
    unidad = apu.get("unidad")
    insumos = apu.get("insumos")
    if not isinstance(unidad, str) or not unidad:
        raise ValueError("APU inválido: 'unidad' debe ser string")
    if not isinstance(insumos, list):
        raise ValueError("APU inválido: 'insumos' debe ser lista")

    composiciones_data: list[dict[str, Any]] = []

    for item in insumos:
        if not isinstance(item, dict):
            raise ValueError("APU inválido: cada insumo debe ser objeto")

        tipo = str(item.get("tipo") or "").strip()
        nombre = str(item.get("nombre") or "").strip()
        unidad_compra = str(item.get("unidad") or "").strip()
        rendimiento = item.get("rendimiento")
        precio_guate = item.get("precio_guate")

        if not tipo or not nombre or not unidad_compra:
            raise ValueError("APU inválido: tipo/nombre/unidad requeridos")
        if not isinstance(rendimiento, (int, float)) or rendimiento <= 0:
            raise ValueError("APU inválido: rendimiento debe ser número > 0")
        if not isinstance(precio_guate, (int, float)) or precio_guate < 0:
            raise ValueError("APU inválido: precio_guate debe ser número >= 0")

        existente = (
            db.query(models.InsumoMaestro)
            .filter(models.InsumoMaestro.tipo == tipo)
            .filter(models.InsumoMaestro.descripcion == nombre)
            .filter(models.InsumoMaestro.unidad_compra == unidad_compra)
            .first()
        )

        if existente is None:
            existente = models.InsumoMaestro(
                tipo=tipo,
                descripcion=nombre,
                unidad_compra=unidad_compra,
                precio_referencial_gtq=float(precio_guate),
                ultimo_sondeo_ia=datetime.datetime.utcnow(),
            )
            db.add(existente)
            db.flush()
        else:
            setattr(existente, "precio_referencial_gtq", float(precio_guate))
            setattr(existente, "ultimo_sondeo_ia", datetime.datetime.utcnow())

        composiciones_data.append(
            {
                "insumo_id": existente.id,
                "rendimiento": float(rendimiento),
                "desperdicio": float(desperdicio_default),
                "precio_aplicado": float(precio_guate),
            }
        )

    costo_unitario_ia = sum(
        float(c["rendimiento"]) * float(c["precio_aplicado"]) * float(c["desperdicio"])
        for c in composiciones_data
    )

    renglon = models.PresupuestoRenglon(
        proyecto_id=proyecto_id,
        descripcion=nombre_renglon,
        unidad_medida=unidad,
        cantidad_total=float(cantidad_total),
        costo_unitario_ia=float(costo_unitario_ia),
    )
    db.add(renglon)
    db.flush()

    composiciones: list[models.APUComposicion] = []
    for item in composiciones_data:
        c = models.APUComposicion(
            renglon_id=renglon.id,
            insumo_id=item["insumo_id"],
            rendimiento=item["rendimiento"],
            desperdicio=item["desperdicio"],
            precio_aplicado=item["precio_aplicado"],
        )
        db.add(c)
        composiciones.append(c)

    return renglon, composiciones
