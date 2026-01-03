from __future__ import annotations

import csv
import io
from typing import Any

from sqlalchemy.orm import Session

from backend import models


def _first_present(row: dict[str, Any], keys: list[str]) -> str | None:
    for key in keys:
        if key in row and row[key] not in (None, ""):
            return str(row[key])
    return None


def _parse_float(value: Any) -> float:
    s = str(value).strip()
    if s == "":
        return 0.0

    # Allow "1,234.56" and "1.234,56" and "1234,56"
    s = s.replace(" ", "")
    if "," in s and "." in s:
        # Decide decimal separator by last occurrence
        if s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")
    else:
        s = s.replace(",", ".")

    return float(s)


def procesar_csv_maestro(
    file_bytes: bytes,
    db: Session,
    *,
    departamento_default: str = "Guatemala",
    estado_oc: str = "entregada",
) -> dict[str, Any]:
    """Importa un CSV de compras/maestro al esquema actual.

    Crea/encuentra:
    - Proyecto (por nombre)
    - InsumoMaestro (por descripcion + tipo)
    Registra egresos de materiales como:
    - OrdenCompra (1 por proyecto por importación)
    - DetalleOrdenCompra (1 por fila)

    Columnas esperadas (sinónimos):
    - proyecto | nombre_proyecto
    - departamento (opcional)
    - material | descripcion
    - tipo (opcional; default "material")
    - unidad_compra | unidad (requerida si se crea el insumo)
    - cantidad
    - costo_unitario | precio_unitario | precio

    Otras columnas (p.ej. proveedor, categoria_gasto) se ignoran.
    """

    try:
        text = file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = file_bytes.decode("latin-1")

    stream = io.StringIO(text)
    reader = csv.DictReader(stream)

    if not reader.fieldnames:
        raise ValueError("CSV sin encabezados")

    proyectos_creados = 0
    insumos_creados = 0
    ocs_creadas = 0
    detalles_creados = 0

    cache_proyectos: dict[str, models.Proyecto] = {}
    cache_insumos: dict[tuple[str, str], models.InsumoMaestro] = {}
    oc_por_proyecto_id: dict[Any, models.OrdenCompra] = {}

    estado_oc_norm = (estado_oc or "").strip().lower() or "entregada"

    for idx, row in enumerate(reader, start=2):  # header is line 1
        proyecto_nombre = _first_present(row, ["proyecto", "nombre_proyecto"])
        material_desc = _first_present(row, ["material", "descripcion"])
        if not proyecto_nombre or not material_desc:
            raise ValueError(f"Fila {idx}: faltan columnas requeridas proyecto/material")

        proyecto_nombre = proyecto_nombre.strip()
        material_desc = material_desc.strip()

        departamento = (
            _first_present(row, ["departamento"]) or departamento_default
        ).strip() or departamento_default

        tipo = (_first_present(row, ["tipo"]) or "material").strip().lower() or "material"

        unidad = _first_present(row, ["unidad_compra", "unidad"])
        unidad = (unidad or "").strip()

        cantidad_raw = _first_present(row, ["cantidad"])
        precio_raw = _first_present(row, ["costo_unitario", "precio_unitario", "precio"])
        if cantidad_raw is None or precio_raw is None:
            raise ValueError(f"Fila {idx}: faltan columnas cantidad/costo_unitario")

        cantidad = _parse_float(cantidad_raw)
        precio_unitario = _parse_float(precio_raw)
        if cantidad <= 0:
            raise ValueError(f"Fila {idx}: cantidad inválida ({cantidad_raw})")
        if precio_unitario < 0:
            raise ValueError(f"Fila {idx}: costo_unitario inválido ({precio_raw})")

        # 1) Proyecto
        proyecto = cache_proyectos.get(proyecto_nombre)
        if proyecto is None:
            proyecto = (
                db.query(models.Proyecto)
                .filter(models.Proyecto.nombre_proyecto == proyecto_nombre)
                .first()
            )
            if proyecto is None:
                proyecto = models.Proyecto(
                    nombre_proyecto=proyecto_nombre,
                    departamento=departamento,
                )
                db.add(proyecto)
                db.flush()
                proyectos_creados += 1
            cache_proyectos[proyecto_nombre] = proyecto

        # 2) Insumo
        key = (material_desc, tipo)
        insumo = cache_insumos.get(key)
        if insumo is None:
            insumo = (
                db.query(models.InsumoMaestro)
                .filter(models.InsumoMaestro.descripcion == material_desc)
                .filter(models.InsumoMaestro.tipo == tipo)
                .first()
            )
            if insumo is None:
                if not unidad:
                    raise ValueError(
                        f"Fila {idx}: el insumo '{material_desc}' no existe y falta unidad_compra/unidad"
                    )
                insumo = models.InsumoMaestro(
                    descripcion=material_desc,
                    tipo=tipo,
                    unidad_compra=unidad,
                    precio_referencial_gtq=float(precio_unitario),
                )
                db.add(insumo)
                db.flush()
                insumos_creados += 1
            cache_insumos[key] = insumo

        # 3) Orden de compra (1 por proyecto por importación)
        oc = oc_por_proyecto_id.get(proyecto.id)
        if oc is None:
            oc = models.OrdenCompra(proyecto_id=proyecto.id, estado=estado_oc_norm)
            db.add(oc)
            db.flush()
            oc_por_proyecto_id[proyecto.id] = oc
            ocs_creadas += 1

        subtotal = float(cantidad) * float(precio_unitario)
        detalle = models.DetalleOrdenCompra(
            oc_id=oc.id,
            insumo_id=insumo.id,
            cantidad_pedida=float(cantidad),
            precio_unitario_compra=float(precio_unitario),
            subtotal=float(subtotal),
        )
        db.add(detalle)
        detalles_creados += 1

        oc.total_oc = float(getattr(oc, "total_oc", 0.0) or 0.0) + float(subtotal)

    db.commit()

    return {
        "status": "ok",
        "proyectos_creados": proyectos_creados,
        "insumos_creados": insumos_creados,
        "ordenes_compra_creadas": ocs_creadas,
        "detalles_creados": detalles_creados,
    }
