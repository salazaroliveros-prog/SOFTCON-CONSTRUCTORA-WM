import os
from typing import Any, Mapping

from dotenv import load_dotenv


def enviar_resumen_diario(datos_resumen: Mapping[str, Any]) -> str:
    """Envía un resumen diario por WhatsApp usando Twilio.

    Espera un dict/Mapping con las claves:
    - nombre_dueno
    - utilidad_hoy
    - ahorro_personal
    - alertas_activas

    Variables de entorno requeridas:
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - MI_CELULAR (formato E.164, ej: +502XXXXXXXX)

    Opcionales:
    - TWILIO_WHATSAPP_FROM (default: whatsapp:+14155238886)

    Retorna: message.sid
    """

    # En dev, permite cargar .env; en prod normalmente se ignora (vars ya vienen seteadas).
    load_dotenv()

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    mi_celular = os.getenv("MI_CELULAR")
    from_whatsapp = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

    if not account_sid or not auth_token:
        raise ValueError("Faltan TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN")
    if not mi_celular:
        raise ValueError("Falta MI_CELULAR")

    nombre_dueno = datos_resumen.get("nombre_dueno", "")
    utilidad_hoy = datos_resumen.get("utilidad_hoy", 0)
    ahorro_personal = datos_resumen.get("ahorro_personal", 0)
    alertas_activas = datos_resumen.get("alertas_activas", 0)

    mensaje = f"""
*📊 RESUMEN DIARIO CONSTRUCT-ERP*
----------------------------------
Hola {nombre_dueno},

✅ *Utilidad de Obra Hoy:* Q{utilidad_hoy}
💰 *Ahorro Personal:* Q{ahorro_personal}
🚨 *Alertas Críticas:* {alertas_activas}

_El sistema sigue vigilando tu rentabilidad._
""".strip()

    try:
        from twilio.rest import Client  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "Twilio no está instalado. Instala con: pip install twilio"
        ) from exc

    client = Client(account_sid, auth_token)
    message = client.messages.create(
        from_=from_whatsapp,
        body=mensaje,
        to=f"whatsapp:{mi_celular}",
    )

    return message.sid
