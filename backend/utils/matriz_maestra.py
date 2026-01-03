from __future__ import annotations

from typing import Any


def obtener_matriz_renglones_maestra() -> list[dict[str, Any]]:
    """Matriz de renglones maestra (Secuencia Constructiva Maestra).

    Estructura:
      - fase
      - renglon
      - unidad
      - insumos_clave (texto guía para IA/calculadora)
    """

    return [
        {
            "fase": "1. Preliminares",
            "renglon": "Replanteo Topográfico",
            "unidad": "m2",
            "insumos_clave": "Estacas, mojoneras, equipo nivelación.",
        },
        {
            "fase": "1. Preliminares",
            "renglon": "Limpieza, Chapeo y Destronque",
            "unidad": "m2",
            "insumos_clave": "Mano de obra (jornales), herramienta menor.",
        },
        {
            "fase": "1. Preliminares",
            "renglon": "Trazo y Estaqueado",
            "unidad": "m2",
            "insumos_clave": "Cal, madera rústica, cordel, estacas.",
        },
        {
            "fase": "2. Cimentación",
            "renglon": "Zanjeo (Excavación)",
            "unidad": "m3",
            "insumos_clave": "Mano de obra por dureza de suelo regional.",
        },
        {
            "fase": "2. Cimentación",
            "renglon": "Cimentación Corrida",
            "unidad": "ml",
            "insumos_clave": "Hierro de refuerzo, concreto, piedrín.",
        },
        {
            "fase": "2. Cimentación",
            "renglon": "Zapatas (Estructural)",
            "unidad": "unid",
            "insumos_clave": "Acero de refuerzo, concreto 3000 PSI, formaleta.",
        },
        {
            "fase": "3. Estructura",
            "renglon": "Columnas (Principales y Amarre)",
            "unidad": "ml",
            "insumos_clave": "Varilla de acero, estribos, concreto, alambre.",
        },
        {
            "fase": "3. Estructura",
            "renglon": "Muros hasta Solera de Humedad",
            "unidad": "m2",
            "insumos_clave": "Block, mezcla (arena/cemento), impermeabilizante.",
        },
        {
            "fase": "4. Elevaciones",
            "renglon": "Muro hasta Solera Intermedia 1",
            "unidad": "m2",
            "insumos_clave": "Block, concreto de solera, andamios.",
        },
        {
            "fase": "4. Elevaciones",
            "renglon": "Muro hasta Solera Intermedia 2",
            "unidad": "m2",
            "insumos_clave": "Block, refuerzo vertical, mezcla.",
        },
        {
            "fase": "4. Elevaciones",
            "renglon": "Muro hasta Solera Final",
            "unidad": "m2",
            "insumos_clave": "Block, solera de corona, amarres superiores.",
        },
        {
            "fase": "5. Cubiertas",
            "renglon": "Losa Sólida / Prefabricada",
            "unidad": "m2",
            "insumos_clave": "Vigueta y bovedilla o armado de acero, concreto.",
        },
        {
            "fase": "5. Cubiertas",
            "renglon": "Estructura Metálica + Techo",
            "unidad": "m2",
            "insumos_clave": "Costaneras, lámina/teja, soldadura, pintura.",
        },
        {
            "fase": "6. Acabados",
            "renglon": "Acabados en Muros (Cernido/Repello)",
            "unidad": "m2",
            "insumos_clave": "Mezcla lista o proporción arena/cal/cemento.",
        },
        {
            "fase": "6. Acabados",
            "renglon": "Acabados en Techos y Pisos",
            "unidad": "m2",
            "insumos_clave": "Piso cerámico, pegamix, pintura, cielos falsos.",
        },
        {
            "fase": "7. Carpintería",
            "renglon": "Puertas y Ventanas",
            "unidad": "unid",
            "insumos_clave": "Marcos, madera/metal/aluminio, vidrios, chapas.",
        },
        {
            "fase": "8. Instalaciones",
            "renglon": "Hidráulicas y Sanitarias",
            "unidad": "global",
            "insumos_clave": "Tubería PVC, accesorios, cajas de registro.",
        },
        {
            "fase": "8. Instalaciones",
            "renglon": "Eléctricas (Fuerza e Iluminación)",
            "unidad": "ducto",
            "insumos_clave": "Poliducto, cable, tableros, placas, luminarias.",
        },
        {
            "fase": "9. Finalización",
            "renglon": "Limpieza y Entrega Final",
            "unidad": "global",
            "insumos_clave": "Mano de obra final, retiro de ripio, entrega.",
        },
    ]
