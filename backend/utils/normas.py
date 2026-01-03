from __future__ import annotations

from typing import Dict, List, Tuple


def calcular_insumos_por_renglon(nombre_renglon: str, cantidad_total: float) -> Dict[str, float]:
    """Calcula insumos base por renglón usando reglas simples.

    Nota: esto es un motor de reglas inicial (heurístico). Para producción,
    lo ideal es parametrizar por tipo de elemento, norma y unidad.
    """

    nombre = (nombre_renglon or "").lower()
    try:
        cantidad = float(cantidad_total or 0)
    except Exception:
        cantidad = 0.0

    if cantidad <= 0:
        return {}

    # Valores por defecto: retornar cantidades totales estimadas.
    if "levantado" in nombre or "muro" in nombre:
        # Ejemplo: Muro de block de 0.14x0.19x0.39
        return {
            "Block de 0.14": cantidad * 12.5 * 1.05,  # +5% desperdicio
            "Cemento": cantidad * 0.45,  # Bolsas
            "Arena de río": cantidad * 0.045,  # m3
            "Agua": cantidad * 10.0,  # Litros
        }

    if "fundicion" in nombre or "fundición" in nombre or "concreto" in nombre:
        # Ejemplo: Concreto 3000 PSI (Proporción 1:2:3)
        return {
            "Cemento": cantidad * 9.8,
            "Arena de río": cantidad * 0.55,
            "Piedrin": cantidad * 0.70,
        }

    return {}


def calcular_insumos_por_renglon_detallado(
    nombre_renglon: str,
    cantidad_total: float,
) -> Tuple[str, List[dict]]:
    """Versión detallada: incluye unidades y rendimiento por unidad del renglón.

    Retorna:
      (unidad_renglon, [{nombre, unidad, cantidad_total, rendimiento}])

    Donde:
      - cantidad_total: cantidad física total del insumo para el renglón completo
      - rendimiento: consumo por 1 unidad del renglón (cantidad_total_insumo / cantidad_total_renglon)
    """

    nombre = (nombre_renglon or "").strip()
    nombre_l = nombre.lower()

    try:
        cantidad = float(cantidad_total or 0)
    except Exception:
        cantidad = 0.0

    if cantidad <= 0:
        return "", []

    # Inferir unidad del renglón (heurístico mínimo)
    if "muro" in nombre_l or "levantado" in nombre_l:
        unidad_renglon = "m2"
    elif "concreto" in nombre_l or "fundicion" in nombre_l or "fundición" in nombre_l:
        unidad_renglon = "m3"
    else:
        unidad_renglon = "u"

    cantidades = calcular_insumos_por_renglon(nombre, cantidad)
    detalles: List[dict] = []

    # Unidades por defecto para los insumos (mínimo para no dejar vacío)
    unidad_default = {
        "block": "unidad",
        "cemento": "bolsa",
        "arena": "m3",
        "piedrin": "m3",
        "agua": "L",
    }

    for insumo_nombre, qty_total in cantidades.items():
        key = (insumo_nombre or "").lower()
        unidad = "unidad"
        for k, u in unidad_default.items():
            if k in key:
                unidad = u
                break

        try:
            qty_total_f = float(qty_total or 0)
        except Exception:
            qty_total_f = 0.0

        rendimiento = qty_total_f / cantidad if cantidad else 0.0

        detalles.append(
            {
                "nombre": insumo_nombre,
                "unidad": unidad,
                "cantidad_total": qty_total_f,
                "rendimiento": rendimiento,
            }
        )

    return unidad_renglon, detalles
