"""Compat layer.

Este módulo existe para soportar imports estilo snippet, por ejemplo:

    from ia_service import consultar_precios_ia

La implementación vive en `ia_apu.py`.

Nota: el proyecto actualmente mezcla imports "planos" (ejecutando desde
`backend/`) y imports como paquete (`backend.*`). Por eso este try/except.
"""

try:
    from ia_apu import consultar_precios_ia, generar_analisis_total
except ModuleNotFoundError:  # pragma: no cover
    from backend.ia_apu import consultar_precios_ia, generar_analisis_total
