import json
import os
from typing import Any

from openai import OpenAI


def generar_composicion_apu_ia(nombre_renglon: str, departamento: str) -> dict[str, Any]:
    """Genera un APU (composición) usando un LLM.

    Retorna un dict con esta estructura:
    {
      "unidad": "m2",
      "insumos": [
        {"tipo": "material", "nombre": "...", "unidad": "...", "rendimiento": 0.0, "precio_guate": 0.0}
      ]
    }
    """

    prompt = f"""
Genera el APU para el renglón '{nombre_renglon}' en {departamento}, Guatemala.
Devuelve un JSON estrictamente con esta estructura:
{{
  "unidad": "m2",
  "insumos": [
    {{"tipo": "material", "nombre": "Block de 15", "unidad": "unidad", "rendimiento": 12.5, "precio_guate": 5.50}},
    {{"tipo": "mano_obra", "nombre": "Albañil + Ayudante", "unidad": "m2", "rendimiento": 1.0, "precio_guate": 45.00}}
  ]
}}
""".strip()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Falta OPENAI_API_KEY en el entorno (backend/.env)")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": "Responde únicamente con JSON válido. Sin texto adicional.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    content = (response.choices[0].message.content or "").strip()
    data = json.loads(content)

    _validar_estructura_apu(data)
    return data


def consultar_precios_ia(renglon: str, departamento: str) -> dict[str, Any]:
    """Compat: genera APU en el formato del snippet compartido.

    Este wrapper evita duplicar lógica/llamadas a OpenAI: reutiliza
    `generar_composicion_apu_ia()` (que es nuestra fuente de verdad).

    Formato de salida:
    {
      "unidad_medida": "m2",
      "insumos": [
        {"nombre": "...", "tipo": "material", "unidad": "...", "rendimiento": 0.25, "precio_unitario": 85.50}
      ]
    }
    """

    base = generar_composicion_apu_ia(nombre_renglon=renglon, departamento=departamento)

    unidad = base.get("unidad") or base.get("unidad_medida") or ""
    insumos_in = base.get("insumos") if isinstance(base.get("insumos"), list) else []

    insumos_out: list[dict[str, Any]] = []
    for item in insumos_in:
        if not isinstance(item, dict):
            continue

        precio = item.get("precio_unitario")
        if precio is None:
            precio = item.get("precio_guate")

        insumos_out.append(
            {
                "nombre": item.get("nombre", ""),
                "tipo": item.get("tipo", "material"),
                "unidad": item.get("unidad", ""),
                "rendimiento": float(item.get("rendimiento") or 0),
                "precio_unitario": float(precio or 0),
            }
        )

    return {
        "unidad_medida": unidad,
        "insumos": insumos_out,
    }


def generar_apu_preciso_con_cantidades(
    *,
    nombre_renglon: str,
    departamento: str,
    unidad_renglon: str,
    insumos_materiales: list[dict[str, Any]],
) -> dict[str, Any]:
    """Genera APU usando cantidades matemáticas como base.

    `insumos_materiales` debe incluir items con:
      - nombre (str)
      - unidad (str)
      - rendimiento (float)  # consumo por 1 unidad del renglón

    El modelo debe:
      - mantener rendimiento tal cual para materiales
      - llenar precio_guate por insumo (precio unitario en Q)
      - agregar mano_obra (y/o equipo si aplica) con rendimiento + precio_guate
    """

    # Sanitizar input para el prompt
    base_items: list[dict[str, Any]] = []
    for it in insumos_materiales or []:
        if not isinstance(it, dict):
            continue
        nombre = str(it.get("nombre") or "").strip()
        unidad = str(it.get("unidad") or "").strip()
        rendimiento = it.get("rendimiento")
        if not nombre or not unidad:
            continue
        try:
            rendimiento_f = float(rendimiento or 0)
        except Exception:
            rendimiento_f = 0.0
        if rendimiento_f <= 0:
            continue
        base_items.append(
            {
                "tipo": "material",
                "nombre": nombre,
                "unidad": unidad,
                "rendimiento": rendimiento_f,
                "precio_guate": 0.0,
            }
        )

    if not base_items:
        raise ValueError("No hay insumos materiales calculados para generar APU preciso")

    unidad_out = (unidad_renglon or "").strip() or "u"

    prompt = f"""
Proyecto en {departamento}, Guatemala.
Necesito el APU FINAL para el renglón: {nombre_renglon}

Base matemática (NO cambies 'rendimiento' de los materiales):
{json.dumps(base_items, ensure_ascii=False)}

Devuelve ÚNICAMENTE JSON válido con esta estructura exacta:
{{
  \"unidad\": \"{unidad_out}\",
  \"insumos\": [
    {{\"tipo\": \"material\", \"nombre\": \"...\", \"unidad\": \"...\", \"rendimiento\": 0.0, \"precio_guate\": 0.0}},
    {{\"tipo\": \"mano_obra\", \"nombre\": \"...\", \"unidad\": \"{unidad_out}\", \"rendimiento\": 0.0, \"precio_guate\": 0.0}}
  ]
}}

Reglas:
1) Para cada material de la base, copia exactamente nombre/unidad/rendimiento y llena precio_guate (precio unitario en quetzales) para {departamento}.
2) Agrega al menos 1 insumo de tipo mano_obra (y opcionalmente equipo) para ejecutar 1 {unidad_out} del renglón. Define su rendimiento y precio_guate unitario.
3) No agregues texto extra. Solo JSON.
""".strip()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Falta OPENAI_API_KEY en el entorno (backend/.env)")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": "Responde únicamente con JSON válido. Sin texto adicional.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    content = (response.choices[0].message.content or "").strip()
    data = json.loads(content)
    _validar_estructura_apu(data)
    return data


def _validar_estructura_apu(data: Any) -> None:
    if not isinstance(data, dict):
        raise ValueError("La respuesta no es un JSON objeto")
    if "unidad" not in data or "insumos" not in data:
        raise ValueError("Faltan llaves requeridas: unidad/insumos")
    if not isinstance(data["insumos"], list):
        raise ValueError("insumos debe ser una lista")

    for insumo in data["insumos"]:
        if not isinstance(insumo, dict):
            raise ValueError("Cada insumo debe ser un objeto")
        for key in ("tipo", "nombre", "unidad", "rendimiento", "precio_guate"):
            if key not in insumo:
                raise ValueError(f"Insumo incompleto, falta: {key}")


def generar_analisis_total(
    renglon: str,
    cantidad: float,
    departamento: str,
    *,
    salario_minimo_mensual_gtq: float | None = None,
    factor_transporte_regional: float | None = None,
    fecha_referencia: str | None = None,
) -> dict[str, Any]:
    """Genera un análisis de costos directos/indirectos en JSON.

    Importante: este modelo NO navega web en tiempo real. Si quieres datos
    100% exactos (p.ej. salario mínimo 2026 o precios actuales), pásalos en
    los parámetros opcionales y el modelo los respetará.
    """

    try:
        cantidad_f = float(cantidad)
    except Exception:
        cantidad_f = 0.0
    if cantidad_f <= 0:
        raise ValueError("cantidad debe ser > 0")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Falta OPENAI_API_KEY en el entorno (backend/.env)")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=api_key)

    refs: dict[str, Any] = {
        "fecha_referencia": fecha_referencia,
        "salario_minimo_mensual_gtq": salario_minimo_mensual_gtq,
        "factor_transporte_regional": factor_transporte_regional,
    }

    prompt = f"""
Necesito un análisis de costos para obra en {departamento}, Guatemala.
Renglón: {renglon}
Cantidad: {cantidad_f}

Notas:
- Si te doy valores en 'refs', úsalos como VERDAD y no los inventes.
- Si algún valor no viene en refs, puedes estimarlo (pero márcalo como estimado).

refs (pueden venir null):
{json.dumps(refs, ensure_ascii=False)}

Devuelve ÚNICAMENTE JSON con esta estructura:
{{
  "renglon": "...",
  "cantidad": 0,
  "departamento": "...",
  "moneda": "GTQ",
  "supuestos": ["..."],
  "costos": {{
    "directos": [{{"categoria":"material|mano_obra|equipo|subcontrato","concepto":"...","unidad":"...","cantidad":0,"precio_unitario":0,"subtotal":0,"estimado":true}}],
    "indirectos": [{{"categoria":"transporte|herramientas|administracion|imprevistos|otros","concepto":"...","base":"...","monto":0,"estimado":true}}],
    "totales": {{"directos":0,"indirectos":0,"total":0}}
  }},
  "advertencias": ["..."],
  "version": "v1"
}}
""".strip()

    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": "Responde únicamente con JSON válido. Sin texto adicional.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    content = (response.choices[0].message.content or "").strip()
    data = json.loads(content)
    if not isinstance(data, dict):
        raise ValueError("La respuesta no es un JSON objeto")
    return data
