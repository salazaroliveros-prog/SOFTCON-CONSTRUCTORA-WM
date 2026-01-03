from fastapi import Body, FastAPI, Depends, HTTPException, Request, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi_utils.tasks import repeat_every
from sqlalchemy import case, func
from sqlalchemy.orm import Session
import os
import datetime
import uuid
import pathlib
import shutil
from backend.database import SessionLocal, engine, get_db
from backend.ia_auditor import (
    calcular_consumo_materiales_por_avance,
    obtener_teorico_disponible,
    verificar_desviacion_presupuesto,
)
from backend.planilla_service import calcular_pago_semanal
from pydantic import BaseModel, Field, AliasChoices
from backend.ia_apu import generar_composicion_apu_ia, generar_apu_preciso_con_cantidades
from backend.ia_service import consultar_precios_ia, generar_analisis_total
from backend.apu_service import crear_renglon_y_composicion_desde_apu_json
from backend.schemas import (
    APUResponse,
    InsumoBase,
    ItemCompra,
    UserCreate,
    AsistenciaGPSRequest,
    OrdenCompraEstadoUpdate,
    GastoPersonalCreate,
    Proyecto as ProyectoSchema,
)
from backend.finanzas_service import calcular_balance_vida_negocio, calcular_estado_financiero_proyecto
from backend.auth import RoleChecker, create_access_token, get_current_user, hash_password, verify_password
from backend import models
from backend.utils.pdf_gen import generar_pdf_presupuesto, generar_pdf_presupuesto_profesional
from backend.utils.normas import calcular_insumos_por_renglon, calcular_insumos_por_renglon_detallado
from backend.utils.matriz_maestra import obtener_matriz_renglones_maestra
from backend.whatsapp_service import enviar_resumen_diario
app = FastAPI()


class BootstrapAdminRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=100)
    password: str = Field(min_length=6, max_length=128)


class UpdateUserRoleRequest(BaseModel):
    rol: str = Field(min_length=1, max_length=20)


class UpdateUserActiveRequest(BaseModel):
    is_active: bool


class ResumenDiarioWhatsAppRequest(BaseModel):
    nombre_dueno: str = Field(..., min_length=1)
    utilidad_hoy: float = 0.0
    ahorro_personal: float = 0.0
    alertas_activas: int = 0


class NormasInsumosRequest(BaseModel):
    nombre_renglon: str = Field(..., min_length=1)
    cantidad_total: float = Field(..., gt=0)


class AnalisisTotalRequest(BaseModel):
    renglon: str = Field(..., min_length=1)
    cantidad: float = Field(..., gt=0)
    departamento: str = Field(..., min_length=1)
    salario_minimo_mensual_gtq: float | None = Field(default=None, ge=0)
    factor_transporte_regional: float | None = Field(default=None, ge=0)
    fecha_referencia: str | None = None


class InyectarMatrizMaestraRequest(BaseModel):
    departamento: str = Field(..., min_length=1)
    # cantidad base por renglón: se usa como "1 unidad" para generar rendimientos y costos unitarios.
    cantidad_base: float = Field(default=1.0, gt=0)


_uploads_dir = pathlib.Path(__file__).resolve().parent / "uploads"
_uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")

@app.on_event("startup")
def _startup_init_db():
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception as exc:
        import logging

        logging.getLogger("uvicorn.error").error("DB init failed: %s", exc)


@app.on_event("startup")
@repeat_every(seconds=60 * 60 * 24)
def reporte_automatico_whatsapp() -> None:
    # En plataformas como Railway, es común tener múltiples instancias.
    # Para evitar envíos duplicados, este scheduler queda deshabilitado por defecto.
    if os.getenv("ENABLE_WHATSAPP_REPEAT_EVERY", "false").lower() not in {"1", "true", "yes"}:
        return

    db = SessionLocal()
    try:
        # 1) Lógica mínima para obtener datos del día
        # Nota: por ahora calcula cuántas obras tienen alerta crítica de sobrecosto.
        proyectos = db.query(models.Proyecto).all()
        alertas_criticas = 0
        for p in proyectos:
            try:
                res = verificar_desviacion_presupuesto(db, p.id)
                if res.get("alerta_critica"):
                    alertas_criticas += 1
            except Exception:
                continue

        datos = {
            "nombre_dueno": os.getenv("NOMBRE_DUENO", ""),
            "utilidad_hoy": 0.0,
            "ahorro_personal": 0.0,
            "alertas_activas": alertas_criticas,
        }

        # 2) Enviar a WhatsApp
        enviar_resumen_diario(datos)
        print("Reporte diario enviado a WhatsApp")
    except Exception as exc:
        import logging

        logging.getLogger("uvicorn.error").error("WhatsApp daily report failed: %s", exc)
    finally:
        db.close()


def _require_whatsapp_cron_token(x_cron_token: str | None) -> None:
    expected = os.getenv("WHATSAPP_CRON_TOKEN")
    if not expected:
        raise HTTPException(
            status_code=503,
            detail="WHATSAPP_CRON_TOKEN no configurado",
        )
    if not x_cron_token or x_cron_token != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/internal/cron/whatsapp-resumen-diario")
def cron_whatsapp_resumen_diario(
    x_cron_token: str | None = Header(default=None, alias="X-CRON-TOKEN"),
):
    # Diseñado para Railway Cron: llamada única a hora fija.
    _require_whatsapp_cron_token(x_cron_token)

    db = SessionLocal()
    try:
        proyectos = db.query(models.Proyecto).all()
        alertas_criticas = 0
        for p in proyectos:
            try:
                res = verificar_desviacion_presupuesto(db, p.id)
                if res.get("alerta_critica"):
                    alertas_criticas += 1
            except Exception:
                continue

        datos = {
            "nombre_dueno": os.getenv("NOMBRE_DUENO", ""),
            "utilidad_hoy": 0.0,
            "ahorro_personal": 0.0,
            "alertas_activas": alertas_criticas,
        }

        sid = enviar_resumen_diario(datos)
        return {"status": "ok", "sid": sid, "alertas_activas": alertas_criticas}
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Online", "msg": "API Construct-ERP Activa"}


@app.post("/apu/normas/insumos")
def apu_normas_insumos(payload: NormasInsumosRequest):
    return {
        "nombre_renglon": payload.nombre_renglon,
        "cantidad_total": float(payload.cantidad_total),
        "insumos": calcular_insumos_por_renglon(payload.nombre_renglon, payload.cantidad_total),
    }


@app.post("/ia/analisis-total")
def ia_analisis_total(payload: AnalisisTotalRequest):
    data = generar_analisis_total(
        payload.renglon,
        payload.cantidad,
        payload.departamento,
        salario_minimo_mensual_gtq=payload.salario_minimo_mensual_gtq,
        factor_transporte_regional=payload.factor_transporte_regional,
        fecha_referencia=payload.fecha_referencia,
    )
    return {"status": "ok", "data": data}


@app.get("/matriz/renglones-maestra")
def matriz_renglones_maestra():
    return {
        "status": "ok",
        "items": obtener_matriz_renglones_maestra(),
    }


@app.post("/proyectos/{proyecto_id}/presupuesto/inyectar-matriz-y-apus")
def inyectar_matriz_maestra_y_generar_apus(
    proyecto_id: uuid.UUID,
    payload: InyectarMatrizMaestraRequest,
    db: Session = Depends(get_db),
):
    """Inyecta TODA la Matriz Maestra y genera APUs.

    Estrategia (B):
    - Si la calculadora técnica tiene regla para el renglón -> APU preciso (cantidades + IA precios/MO)
    - Si no hay regla aún -> fallback a APU IA estándar para no detener el proceso

    Nota: esto puede hacer muchas llamadas a IA (costo/tiempo).
    """

    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    items = obtener_matriz_renglones_maestra()
    if not items:
        raise HTTPException(status_code=500, detail="Matriz maestra vacía")

    ok: list[dict[str, str]] = []
    fallos: list[dict[str, str]] = []

    for it in items:
        fase = str(it.get("fase") or "").strip()
        renglon_base = str(it.get("renglon") or "").strip()
        unidad_hint = str(it.get("unidad") or "").strip()

        if not renglon_base:
            continue

        nombre_renglon = f"{fase} - {renglon_base}" if fase else renglon_base

        try:
            unidad_calc, detalles = calcular_insumos_por_renglon_detallado(
                nombre_renglon=renglon_base,
                cantidad_total=float(payload.cantidad_base),
            )

            # Unidad final: prioridad a calculadora, luego matriz.
            unidad_final = (unidad_calc or "").strip() or (unidad_hint or "").strip() or "u"

            if detalles:
                apu = generar_apu_preciso_con_cantidades(
                    nombre_renglon=nombre_renglon,
                    departamento=payload.departamento,
                    unidad_renglon=unidad_final,
                    insumos_materiales=detalles,
                )
                fuente = "preciso"
            else:
                # Fallback controlado: si aún no hay regla matemática, usar IA estándar.
                apu = generar_composicion_apu_ia(nombre_renglon=nombre_renglon, departamento=payload.departamento)
                # Forzar unidad del renglón si vino por matriz.
                if isinstance(apu, dict) and unidad_final:
                    apu["unidad"] = unidad_final
                fuente = "ia"

            renglon_db, composiciones = crear_renglon_y_composicion_desde_apu_json(
                db,
                proyecto_id=proyecto_id,
                nombre_renglon=nombre_renglon,
                cantidad_total=float(payload.cantidad_base),
                apu=apu,
            )
            db.commit()

            ok.append(
                {
                    "renglon_id": str(renglon_db.id),
                    "renglon": nombre_renglon,
                    "fuente": fuente,
                }
            )
        except Exception as exc:
            db.rollback()
            fallos.append(
                {
                    "renglon": nombre_renglon,
                    "error": str(exc),
                }
            )

    return {
        "status": "ok" if not fallos else "partial",
        "proyecto_id": str(proyecto_id),
        "generados": len(ok),
        "fallidos": len(fallos),
        "detalle_ok": ok,
        "detalle_fallos": fallos,
    }


@app.post("/notificaciones/resumen-diario/whatsapp")
def notificar_resumen_diario_whatsapp(
    payload: ResumenDiarioWhatsAppRequest,
    user: models.Usuario = Depends(get_current_user),
):
    try:
        sid = enviar_resumen_diario(payload.model_dump())
        return {"status": "ok", "sid": sid}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error enviando WhatsApp: {exc}")

@app.get("/finanzas/resumen")
def get_finanzas(db: Session = Depends(get_db)):
    gastos = db.query(models.GastoPersonal).all()
    total = sum(g.monto for g in gastos)
    return {
        "total_gastos": float(total or 0),
        "lista": [
            {
                "id": str(g.id),
                "descripcion": g.descripcion,
                "monto": float(g.monto or 0),
                "categoria": g.categoria,
                "fecha": g.fecha.isoformat() if g.fecha else None,
            }
            for g in gastos
        ],
    }


@app.get("/finanzas-personales/resumen")
def get_resumen_personal(
    db: Session = Depends(get_db),
    user: models.Usuario = Depends(get_current_user),
):
    gastos = (
        db.query(models.GastoPersonal)
        .filter(models.GastoPersonal.usuario_id == user.id)
        .order_by(models.GastoPersonal.fecha.desc())
        .all()
    )
    total = sum(float(g.monto or 0) for g in gastos)

    return {
        "ingresos": 0.0,
        "total_gastos": total,
        "gastos_lista": [
            {
                "id": str(g.id),
                "desc": g.descripcion,
                "monto": float(g.monto or 0),
                "cat": g.categoria,
                "fecha": g.fecha.isoformat() if g.fecha else None,
            }
            for g in gastos
        ],
    }


@app.post("/gastos-personales")
def crear_gasto_personal(
    payload: GastoPersonalCreate,
    db: Session = Depends(get_db),
    user: models.Usuario = Depends(get_current_user),
):
    gasto = models.GastoPersonal(
        usuario_id=user.id,
        categoria=payload.categoria,
        descripcion=payload.descripcion,
        monto=float(payload.monto),
        fecha=payload.fecha or datetime.datetime.utcnow(),
    )
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return {"status": "ok", "id": str(gasto.id)}


@app.post("/finanzas-personales/gasto")
def registrar_gasto_personal(
    payload: GastoPersonalCreate,
    db: Session = Depends(get_db),
    user: models.Usuario = Depends(get_current_user),
):
    return crear_gasto_personal(payload=payload, db=db, user=user)


@app.get("/proyectos")
def leer_proyectos(db: Session = Depends(get_db)) -> list[ProyectoSchema]:
    return db.query(models.Proyecto).all()


@app.get("/inventario/resumen")
def inventario_resumen(
    db: Session = Depends(get_db),
    proyecto_id: uuid.UUID | None = None,
):
    """Resumen de inventario (ENTRADA - SALIDA) por insumo.

    Opcional: filtrar por `proyecto_id`.
    """

    signed_qty = case(
        (models.MovimientoBodega.tipo_movimiento == "ENTRADA", models.MovimientoBodega.cantidad),
        else_=-models.MovimientoBodega.cantidad,
    )

    q = (
        db.query(
            models.InsumoMaestro.id.label("id"),
            models.InsumoMaestro.descripcion.label("descripcion"),
            models.InsumoMaestro.unidad_compra.label("unidad"),
            func.coalesce(func.sum(signed_qty), 0.0).label("cantidad"),
        )
        .join(models.MovimientoBodega, models.MovimientoBodega.insumo_id == models.InsumoMaestro.id)
    )

    if proyecto_id is not None:
        q = q.filter(models.MovimientoBodega.proyecto_id == proyecto_id)

    q = q.group_by(
        models.InsumoMaestro.id,
        models.InsumoMaestro.descripcion,
        models.InsumoMaestro.unidad_compra,
    ).order_by(models.InsumoMaestro.descripcion.asc())

    rows = q.all()
    return [
        {
            "id": str(r.id),
            "descripcion": r.descripcion,
            "unidad": r.unidad,
            "cantidad": float(r.cantidad or 0),
        }
        for r in rows
    ]


@app.get("/proyectos/{proyecto_id}/presupuesto/pdf")
def generar_pdf_presupuesto_proyecto(
    proyecto_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    renglones = (
        db.query(models.PresupuestoRenglon)
        .filter(models.PresupuestoRenglon.proyecto_id == proyecto_id)
        .order_by(models.PresupuestoRenglon.descripcion.asc())
        .all()
    )

    datos = {
        "nombre": getattr(proyecto, "nombre_proyecto", "Proyecto"),
        "departamento": getattr(proyecto, "departamento", ""),
        "renglones": [
            {
                "descripcion": r.descripcion,
                "total": float((r.cantidad_total or 0) * (r.costo_unitario_ia or 0)),
            }
            for r in renglones
        ],
    }

    pdf_path = pathlib.Path(generar_pdf_presupuesto(datos, output_dir=_uploads_dir))
    base = str(request.base_url).rstrip("/")
    url = f"{base}/uploads/{pdf_path.name}"
    return {"status": "ok", "filename": pdf_path.name, "url": url}


@app.get("/proyectos/{proyecto_id}/presupuesto/pdf-profesional")
def generar_pdf_presupuesto_proyecto_profesional(
    proyecto_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    renglones = (
        db.query(models.PresupuestoRenglon)
        .filter(models.PresupuestoRenglon.proyecto_id == proyecto_id)
        .order_by(models.PresupuestoRenglon.descripcion.asc())
        .all()
    )

    datos = {
        "nombre": getattr(proyecto, "nombre_proyecto", "Proyecto"),
        "departamento": getattr(proyecto, "departamento", ""),
        "fecha": datetime.datetime.utcnow().date().isoformat(),
        "renglones": [
            {
                "descripcion": r.descripcion,
                "unidad": getattr(r, "unidad_medida", ""),
                "cantidad": float(getattr(r, "cantidad_total", 0) or 0),
                "precio_unitario": float(getattr(r, "costo_unitario_ia", 0) or 0),
                "total": float((getattr(r, "cantidad_total", 0) or 0) * (getattr(r, "costo_unitario_ia", 0) or 0)),
            }
            for r in renglones
        ],
    }

    pdf_path = pathlib.Path(generar_pdf_presupuesto_profesional(datos, output_dir=_uploads_dir))
    base = str(request.base_url).rstrip("/")
    url = f"{base}/uploads/{pdf_path.name}"
    return {"status": "ok", "filename": pdf_path.name, "url": url}


@app.get("/proyectos/{proyecto_id}/fotos")
def listar_fotos_bitacora(
    proyecto_id: uuid.UUID,
    request: Request,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    limit = max(1, min(int(limit), 200))

    filas = (
        db.query(models.FotoBitacora)
        .filter(models.FotoBitacora.proyecto_id == proyecto_id)
        .order_by(models.FotoBitacora.fecha_registro.desc())
        .limit(limit)
        .all()
    )

    base = str(request.base_url).rstrip("/")
    out: list[dict[str, object]] = []
    for f in filas:
        url = getattr(f, "url_foto", None)
        if isinstance(url, str) and url.startswith("/"):
            url = f"{base}{url}"
        out.append(
            {
                "id": str(f.id),
                "proyecto_id": str(f.proyecto_id) if f.proyecto_id else None,
                "url_foto": url,
                "comentario": getattr(f, "comentario", None),
                "fecha_registro": f.fecha_registro.isoformat() if f.fecha_registro else None,
            }
        )

    return out


@app.post("/proyectos/{proyecto_id}/fotos")
def subir_foto_bitacora(
    proyecto_id: uuid.UUID,
    request: Request,
    foto: UploadFile = File(...),
    comentario: str | None = Form(default=None),
    db: Session = Depends(get_db),
):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    filename = foto.filename or "bitacora.jpg"
    suffix = pathlib.Path(filename).suffix or ".jpg"
    safe_name = f"{uuid.uuid4().hex}{suffix}"
    out_path = _uploads_dir / safe_name

    try:
        with out_path.open("wb") as f:
            shutil.copyfileobj(foto.file, f)

        rel_url = f"/uploads/{safe_name}"
        registro = models.FotoBitacora(
            proyecto_id=proyecto_id,
            url_foto=rel_url,
            comentario=str(comentario) if comentario not in (None, "") else None,
        )
        db.add(registro)
        db.commit()
        db.refresh(registro)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    base = str(request.base_url).rstrip("/")
    return {
        "status": "ok",
        "id": str(registro.id),
        "url_foto": f"{base}{rel_url}",
        "fecha_registro": registro.fecha_registro.isoformat() if registro.fecha_registro else None,
    }

@app.post("/proyectos")
def crear_proyecto(nombre: str, depto: str, db: Session = Depends(get_db)):
    nuevo = models.Proyecto(nombre_proyecto=nombre, departamento=depto)
    db.add(nuevo)
    db.commit()
    return {"status": "ok"}

@app.post("/proyectos/reportar-avance")
def reportar_avance(renglon_id: uuid.UUID, cantidad: float, db: Session = Depends(get_db)):
    renglon = db.query(models.PresupuestoRenglon).filter_by(id=renglon_id).first()
    if renglon is None:
        raise HTTPException(status_code=404, detail="Renglón no encontrado")

    # 1. Registrar el avance físico
    nuevo_avance = models.ReporteAvance(renglon_id=renglon_id, cantidad_avanzada=cantidad)
    db.add(nuevo_avance)
    
    # 2. Lógica Inteligente: Descontar materiales de bodega según el APU
    composicion = db.query(models.APUComposicion).filter_by(renglon_id=renglon_id).all()
    for item in composicion:
        descuento = item.rendimiento * cantidad
        mov = models.MovimientoBodega(
            insumo_id=item.insumo_id,
            proyecto_id=renglon.proyecto_id,
            tipo_movimiento="SALIDA",
            cantidad=descuento
        )
        db.add(mov)
    
    db.commit()
    return {"status": "Avance y materiales actualizados"}

@app.get("/proyectos/{proyecto_id}/alertas")
def obtener_alertas_proyecto(proyecto_id: str, db: Session = Depends(get_db)):
    try:
        proyecto_uuid = uuid.UUID(str(proyecto_id))
    except Exception:
        raise HTTPException(status_code=400, detail="proyecto_id inválido")

    auditoria = verificar_desviacion_presupuesto(db, proyecto_uuid)
    return auditoria


class GenerarAPURequest(BaseModel):
    nombre_renglon: str = Field(min_length=1)
    departamento: str = Field(min_length=1)
    cantidad: float = Field(gt=0, validation_alias=AliasChoices("cantidad", "cantidad_total"))


class GenerarAPUCompatRequest(BaseModel):
    nombre_renglon: str = Field(min_length=1)
    departamento: str = Field(min_length=1)
    cantidad: float = Field(default=1.0, gt=0)


class GenerarAPUPrecisoRequest(BaseModel):
    nombre_renglon: str = Field(min_length=1)
    departamento: str = Field(min_length=1)
    cantidad: float = Field(gt=0, validation_alias=AliasChoices("cantidad", "cantidad_total"))


class ReportarAvanceObraRequest(BaseModel):
    renglon_id: uuid.UUID
    cantidad: float = Field(gt=0)
    lat: float | None = None
    lon: float | None = None
    comentario: str | None = None
    fotos: list[str] = Field(default_factory=list)


@app.post("/apu/generar", response_model=APUResponse)
def generar_apu_preview(payload: GenerarAPURequest):
    apu = generar_composicion_apu_ia(payload.nombre_renglon, payload.departamento)
    insumos = [
        InsumoBase(
            nombre=i["nombre"],
            tipo=i["tipo"],
            unidad=i["unidad"],
            rendimiento=i["rendimiento"],
            precio_guate=i["precio_guate"],
        )
        for i in apu.get("insumos", [])
    ]
    return APUResponse(
        descripcion_renglon=payload.nombre_renglon,
        unidad_medida=apu.get("unidad", ""),
        cantidad=payload.cantidad,
        insumos=insumos,
    )


@app.post("/proyectos/{proyecto_id}/renglones/generar-apu")
def generar_apu_y_guardar(
    proyecto_id: uuid.UUID,
    payload: GenerarAPURequest,
    db: Session = Depends(get_db),
):
    apu = generar_composicion_apu_ia(payload.nombre_renglon, payload.departamento)
    renglon, composiciones = crear_renglon_y_composicion_desde_apu_json(
        db,
        proyecto_id=proyecto_id,
        nombre_renglon=payload.nombre_renglon,
        cantidad_total=payload.cantidad,
        apu=apu,
    )
    db.commit()
    return {
        "status": "ok",
        "renglon_id": str(renglon.id),
        "unidad": renglon.unidad_medida,
        "costo_unitario_ia": renglon.costo_unitario_ia,
        "insumos": len(composiciones),
    }


@app.post("/proyectos/{proyecto_id}/generar-apu")
def generar_apu_inteligente(
    proyecto_id: uuid.UUID,
    request: Request,
    payload: GenerarAPUCompatRequest | None = Body(default=None),
    db: Session = Depends(get_db),
):
    """Compat: endpoint del snippet reutilizando nuestra lógica.

    Soporta:
    - JSON body: { nombre_renglon, departamento, cantidad? }
    - Query params (fallback): ?nombre_renglon=...&departamento=...&cantidad=...
    """

    try:
        if payload is None:
            nombre_renglon = (request.query_params.get("nombre_renglon") or "").strip()
            departamento = (request.query_params.get("departamento") or "").strip()
            cantidad_q = request.query_params.get("cantidad")
            cantidad = float(cantidad_q) if cantidad_q else 1.0
            if not nombre_renglon or not departamento:
                raise HTTPException(
                    status_code=422,
                    detail="Faltan campos: nombre_renglon y departamento (body o query)",
                )
            if cantidad <= 0:
                raise HTTPException(status_code=422, detail="cantidad debe ser > 0")
        else:
            nombre_renglon = payload.nombre_renglon
            departamento = payload.departamento
            cantidad = float(payload.cantidad)

        datos_ia = consultar_precios_ia(nombre_renglon, departamento)

        apu = {
            "unidad": datos_ia.get("unidad_medida", ""),
            "insumos": [
                {
                    "nombre": i.get("nombre", ""),
                    "tipo": i.get("tipo", "material"),
                    "unidad": i.get("unidad", ""),
                    "rendimiento": i.get("rendimiento", 0),
                    "precio_guate": i.get("precio_unitario", 0),
                }
                for i in (datos_ia.get("insumos") or [])
                if isinstance(i, dict)
            ],
        }

        renglon, composiciones = crear_renglon_y_composicion_desde_apu_json(
            db,
            proyecto_id=proyecto_id,
            nombre_renglon=nombre_renglon,
            cantidad_total=float(cantidad),
            apu=apu,
        )
        db.commit()

        return {
            "status": "APU Generado con éxito",
            "renglon_id": str(renglon.id),
            "insumos": len(composiciones),
            "datos": datos_ia,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/proyectos/{proyecto_id}/generar-apu-preciso")
def generar_apu_con_calculadora(
    proyecto_id: uuid.UUID,
    payload: GenerarAPUPrecisoRequest,
    db: Session = Depends(get_db),
):
    """Genera APU usando calculadora (normas) + IA para precios y mano de obra.

    - Calcula cantidades físicas (normas)
    - Pide a IA precios regionales y mano de obra
    - Guarda renglón + composición en BD
    """

    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    try:
        unidad_renglon, detalles = calcular_insumos_por_renglon_detallado(
            payload.nombre_renglon,
            float(payload.cantidad),
        )

        apu = generar_apu_preciso_con_cantidades(
            nombre_renglon=payload.nombre_renglon,
            departamento=payload.departamento,
            unidad_renglon=unidad_renglon,
            insumos_materiales=detalles,
        )

        renglon, composiciones = crear_renglon_y_composicion_desde_apu_json(
            db,
            proyecto_id=proyecto_id,
            nombre_renglon=payload.nombre_renglon,
            cantidad_total=float(payload.cantidad),
            apu=apu,
        )
        db.commit()

        return {
            "status": "APU al 100% calculado",
            "renglon_id": str(renglon.id),
            "unidad": renglon.unidad_medida,
            "costo_unitario_ia": renglon.costo_unitario_ia,
            "insumos": len(composiciones),
            "cantidades_fisicas": calcular_insumos_por_renglon(payload.nombre_renglon, float(payload.cantidad)),
            "apu": apu,
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/proyectos/{proyecto_id}/inyectar-renglon", response_model=APUResponse)
def inyectar_renglon_ia(
    proyecto_id: uuid.UUID,
    payload: GenerarAPURequest,
    db: Session = Depends(get_db),
):
    try:
        apu = generar_composicion_apu_ia(payload.nombre_renglon, payload.departamento)
        crear_renglon_y_composicion_desde_apu_json(
            db,
            proyecto_id=proyecto_id,
            nombre_renglon=payload.nombre_renglon,
            cantidad_total=payload.cantidad,
            apu=apu,
        )
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    insumos = [
        InsumoBase(
            nombre=i["nombre"],
            tipo=i["tipo"],
            unidad=i["unidad"],
            rendimiento=i["rendimiento"],
            precio_guate=i["precio_guate"],
        )
        for i in apu.get("insumos", [])
    ]
    return APUResponse(
        descripcion_renglon=payload.nombre_renglon,
        unidad_medida=apu.get("unidad", ""),
        cantidad=payload.cantidad,
        insumos=insumos,
    )


@app.post("/proyectos/{proyecto_id}/orden-compra")
def crear_orden_compra(
    proyecto_id: uuid.UUID,
    items: list[ItemCompra],
    db: Session = Depends(get_db),
):
    nueva_oc = models.OrdenCompra(proyecto_id=proyecto_id)
    db.add(nueva_oc)
    db.flush()

    total_acumulado_oc = 0.0

    for item in items:
        disponible = obtener_teorico_disponible(db, proyecto_id, item.insumo_id)
        if item.cantidad > disponible:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Exceso de material: El insumo {item.insumo_id} solo tiene "
                    f"{disponible} unidades disponibles en presupuesto."
                ),
            )

        subtotal = float(item.cantidad) * float(item.precio_pactado)
        detalle = models.DetalleOrdenCompra(
            oc_id=nueva_oc.id,
            insumo_id=item.insumo_id,
            cantidad_pedida=float(item.cantidad),
            precio_unitario_compra=float(item.precio_pactado),
            subtotal=subtotal,
        )
        total_acumulado_oc += subtotal
        db.add(detalle)

    nueva_oc.total_oc = total_acumulado_oc
    db.commit()
    return {"status": "Orden de Compra creada exitosamente", "oc_id": str(nueva_oc.id)}


@app.post("/campo/reportar-avance")
async def reportar_avance_obra(request: Request, db: Session = Depends(get_db)):
    content_type = (request.headers.get("content-type") or "").lower()

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        renglon_id_raw = form.get("renglon_id")
        cantidad_raw = form.get("cantidad")

        if not renglon_id_raw or not cantidad_raw:
            raise HTTPException(status_code=400, detail="Faltan campos renglon_id/cantidad")

        try:
            renglon_id = uuid.UUID(str(renglon_id_raw))
            cantidad = float(str(cantidad_raw))
        except Exception:
            raise HTTPException(status_code=400, detail="renglon_id/cantidad inválidos")

        comentario = form.get("comentario")
        lat_raw = form.get("lat") or form.get("latitud")
        lon_raw = form.get("lon") or form.get("longitud")
        lat = float(lat_raw) if lat_raw not in (None, "") else None
        lon = float(lon_raw) if lon_raw not in (None, "") else None
        fotos_urls: list[str] = []

        foto = form.get("foto")
        if foto is not None:
            # Starlette returns UploadFile for file inputs
            filename = getattr(foto, "filename", None) or "evidencia.jpg"
            suffix = pathlib.Path(filename).suffix or ".jpg"
            safe_name = f"{uuid.uuid4().hex}{suffix}"
            out_path = _uploads_dir / safe_name
            with out_path.open("wb") as f:
                shutil.copyfileobj(foto.file, f)
            fotos_urls.append(f"/uploads/{safe_name}")

    else:
        body = await request.json()
        try:
            payload = ReportarAvanceObraRequest.model_validate(body)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc))

        renglon_id = payload.renglon_id
        cantidad = float(payload.cantidad)
        lat = payload.lat
        lon = payload.lon
        comentario = payload.comentario
        fotos_urls = list(payload.fotos)

    renglon = (
        db.query(models.PresupuestoRenglon)
        .filter(models.PresupuestoRenglon.id == renglon_id)
        .first()
    )
    if renglon is None:
        raise HTTPException(status_code=404, detail="Renglón no encontrado")

    proyecto = (
        db.query(models.Proyecto)
        .filter(models.Proyecto.id == renglon.proyecto_id)
        .first()
    )
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    nuevo_reporte = models.ReporteAvance(
        renglon_id=renglon_id,
        cantidad_avanzada=float(cantidad),
        latitud_gps=lat,
        longitud_gps=lon,
        comentario=str(comentario) if comentario not in (None, "") else None,
    )
    db.add(nuevo_reporte)
    db.flush()

    for url in fotos_urls:
        foto = models.FotoEvidencia(reporte_id=nuevo_reporte.id, url_foto=str(url))
        db.add(foto)

    consumo = calcular_consumo_materiales_por_avance(db, renglon_id, float(cantidad))

    db.commit()

    return {
        "status": "Avance registrado",
        "consumo_estimado": consumo,
        "advertencia_gps": False,
    }


@app.post("/campo/asistencia")
def registrar_asistencia_gps(payload: AsistenciaGPSRequest, db: Session = Depends(get_db)):
    trabajador = (
        db.query(models.Trabajador)
        .filter(models.Trabajador.id == payload.trabajador_id)
        .first()
    )
    if trabajador is None:
        raise HTTPException(status_code=404, detail="Trabajador no encontrado")

    registro = models.RegistroAsistencia(
        trabajador_id=payload.trabajador_id,
        fecha=payload.fecha,
        entrada=payload.fecha,
        gps_check=True,
        latitud_gps=float(payload.latitud),
        longitud_gps=float(payload.longitud),
    )

    try:
        db.add(registro)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "ok", "asistencia_id": str(registro.id)}


@app.get("/campo/evidencias/{proyecto_id}")
def listar_evidencias_proyecto(
    proyecto_id: uuid.UUID,
    request: Request,
    limit: int = 30,
    db: Session = Depends(get_db),
):
    limit = max(1, min(int(limit), 200))

    filas = (
        db.query(models.FotoEvidencia, models.ReporteAvance)
        .join(models.ReporteAvance, models.FotoEvidencia.reporte_id == models.ReporteAvance.id)
        .join(models.PresupuestoRenglon, models.ReporteAvance.renglon_id == models.PresupuestoRenglon.id)
        .filter(models.PresupuestoRenglon.proyecto_id == proyecto_id)
        .order_by(models.ReporteAvance.fecha_reporte.desc())
        .limit(limit)
        .all()
    )

    base = str(request.base_url).rstrip("/")

    reportes: list[dict[str, object]] = []
    for foto, rep in filas:
        url = getattr(foto, "url_foto", None)
        if isinstance(url, str) and url.startswith("/"):
            url = f"{base}{url}"

        reportes.append(
            {
                "id": str(foto.id),
                "reporte_id": str(rep.id),
                "renglon_id": str(rep.renglon_id) if rep.renglon_id else None,
                "fecha_reporte": rep.fecha_reporte.isoformat() if rep.fecha_reporte else None,
                "latitud_gps": rep.latitud_gps,
                "longitud_gps": rep.longitud_gps,
                "url_foto": url,
            }
        )

    return reportes


@app.get("/compras/pendientes-aprobacion")
def compras_pendientes_aprobacion(db: Session = Depends(get_db)):
    filas = (
        db.query(models.OrdenCompra, models.Proyecto)
        .join(models.Proyecto, models.OrdenCompra.proyecto_id == models.Proyecto.id)
        .filter(models.OrdenCompra.estado == "pendiente")
        .order_by(models.OrdenCompra.fecha_emision.desc())
        .all()
    )

    return [
        {
            "id": str(oc.id),
            "proyecto_id": str(oc.proyecto_id) if oc.proyecto_id else None,
            "nombre_proyecto": getattr(p, "nombre_proyecto", None),
            "proveedor": str(oc.proveedor_id) if oc.proveedor_id else None,
            "total": float(oc.total_oc or 0.0),
            "estado": oc.estado,
            "fecha_emision": oc.fecha_emision.isoformat() if oc.fecha_emision else None,
        }
        for (oc, p) in filas
    ]


@app.put("/compras/orden/{oc_id}/estado")
def actualizar_estado_orden_compra(
    oc_id: uuid.UUID,
    payload: OrdenCompraEstadoUpdate,
    db: Session = Depends(get_db),
):
    oc = db.query(models.OrdenCompra).filter(models.OrdenCompra.id == oc_id).first()
    if oc is None:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")

    estado = (payload.estado or "").strip().lower()
    estados_permitidos = {"pendiente", "aprobada", "rechazada", "entregada"}
    if estado not in estados_permitidos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Permitidos: {sorted(estados_permitidos)}",
        )

    oc.estado = estado
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "ok", "oc_id": str(oc.id), "estado": oc.estado}


@app.post("/finanzas/cerrar-planilla/{proyecto_id}")
def cerrar_planilla_semanal(proyecto_id: uuid.UUID, db: Session = Depends(get_db)):
    trabajadores = (
        db.query(models.Trabajador)
        .filter(models.Trabajador.proyecto_actual_id == proyecto_id)
        .all()
    )

    fecha_fin = datetime.datetime.utcnow()
    fecha_inicio = fecha_fin - datetime.timedelta(days=7)

    planillas_generadas: list[dict[str, object]] = []

    try:
        for t in trabajadores:
            monto = calcular_pago_semanal(db, t.id, fecha_inicio, fecha_fin)

            nueva_planilla = models.PagoPlanilla(
                trabajador_id=t.id,
                proyecto_id=proyecto_id,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                monto_total=float(monto),
            )
            db.add(nueva_planilla)
            planillas_generadas.append(
                {
                    "trabajador": t.nombre_completo,
                    "monto_a_pagar": float(monto),
                    "tipo": str(t.tipo_pago),
                }
            )

        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "Planilla calculada", "detalle": planillas_generadas}


@app.post("/auth/register")
def registrar_usuario(user: UserCreate, db: Session = Depends(get_db)):
    hashed = hash_password(user.password)
    nuevo_usuario = models.Usuario(
        username=user.username,
        email=user.email,
        hashed_password=hashed,
        rol=models.UserRole.TRABAJADOR.value,
        is_active=True,
        is_approved=False,
    )

    try:
        db.add(nuevo_usuario)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"message": "Usuario creado. Pendiente de aprobación por administrador"}


@app.post("/auth/bootstrap-admin")
def bootstrap_admin(
    payload: BootstrapAdminRequest,
    x_bootstrap_token: str | None = Header(default=None, alias="X-BOOTSTRAP-TOKEN"),
    db: Session = Depends(get_db),
):
    expected = os.getenv("BOOTSTRAP_ADMIN_TOKEN")
    if not expected:
        raise HTTPException(status_code=503, detail="BOOTSTRAP_ADMIN_TOKEN no configurado")
    if not x_bootstrap_token or x_bootstrap_token != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

    existing_admin = (
        db.query(models.Usuario)
        .filter(models.Usuario.rol == models.UserRole.ADMIN.value)
        .first()
    )
    if existing_admin is not None:
        raise HTTPException(status_code=400, detail="Ya existe un administrador")

    hashed = hash_password(payload.password)
    admin_user = models.Usuario(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed,
        rol=models.UserRole.ADMIN.value,
        is_active=True,
        is_approved=True,
        approved_at=datetime.datetime.utcnow(),
    )

    try:
        db.add(admin_user)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "ok", "message": "Administrador creado", "admin_id": str(admin_user.id)}


@app.get("/auth/admin/users/pending", dependencies=[Depends(RoleChecker(["admin"]))])
def listar_usuarios_pendientes(db: Session = Depends(get_db)):
    pending = (
        db.query(models.Usuario)
        .filter(models.Usuario.is_approved == False)  # noqa: E712
        .order_by(models.Usuario.creado_en.asc())
        .all()
    )
    return {
        "status": "ok",
        "items": [
            {
                "id": str(u.id),
                "username": u.username,
                "email": u.email,
                "rol": u.rol,
                "is_active": bool(getattr(u, "is_active", True)),
                "is_approved": bool(getattr(u, "is_approved", False)),
                "creado_en": u.creado_en.isoformat() if u.creado_en else None,
            }
            for u in pending
        ],
    }


@app.post("/auth/admin/users/{user_id}/approve", dependencies=[Depends(RoleChecker(["admin"]))])
def aprobar_usuario(
    user_id: uuid.UUID,
    admin_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if target is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not bool(getattr(target, "is_active", True)):
        raise HTTPException(status_code=400, detail="No se puede aprobar un usuario desactivado")

    target.is_approved = True
    target.approved_by_id = admin_user.id
    target.approved_at = datetime.datetime.utcnow()

    try:
        db.add(target)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "ok", "message": "Usuario aprobado", "user_id": str(target.id)}


@app.post("/auth/admin/users/{user_id}/role", dependencies=[Depends(RoleChecker(["admin"]))])
def actualizar_rol_usuario(user_id: uuid.UUID, payload: UpdateUserRoleRequest, db: Session = Depends(get_db)):
    allowed_roles = {r.value for r in models.UserRole}
    if payload.rol not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Rol inválido. Roles permitidos: {sorted(allowed_roles)}",
        )

    target = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if target is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    target.rol = payload.rol
    try:
        db.add(target)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "ok", "message": "Rol actualizado", "user_id": str(target.id), "rol": target.rol}


@app.post("/auth/admin/users/{user_id}/active", dependencies=[Depends(RoleChecker(["admin"]))])
def actualizar_activo_usuario(user_id: uuid.UUID, payload: UpdateUserActiveRequest, db: Session = Depends(get_db)):
    target = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if target is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    target.is_active = bool(payload.is_active)
    try:
        db.add(target)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "status": "ok",
        "message": "Estado actualizado",
        "user_id": str(target.id),
        "is_active": bool(target.is_active),
    }


@app.post("/auth/login")
def auth_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    if hasattr(user, "is_active") and not bool(user.is_active):
        raise HTTPException(status_code=403, detail="Usuario desactivado")
    if hasattr(user, "is_approved") and not bool(user.is_approved):
        raise HTTPException(status_code=403, detail="Usuario pendiente de aprobación")

    token = create_access_token({"sub": user.username, "rol": user.rol})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/login")
def login_alias(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return auth_login(form_data=form_data, db=db)


@app.get("/finanzas/flujo-caja-maestro", dependencies=[Depends(RoleChecker(["admin"]))])
def ver_caja_maestra(db: Session = Depends(get_db)):
    return {"data": "Información altamente confidencial"}


@app.get("/finanzas/estado-resultado/{proyecto_id}")
def obtener_resumen_financiero(proyecto_id: uuid.UUID, db: Session = Depends(get_db)):
    datos = calcular_estado_financiero_proyecto(db, proyecto_id)

    historial = models.FlujoCajaConsolidado(
        proyecto_id=proyecto_id,
        total_ingresos=datos["ingresos"],
        total_egresos_materiales=datos["egresos_materiales"],
        total_egresos_planilla=datos["egresos_planilla"],
        utilidad_bruta=datos["utilidad_neta"],
        margen_porcentual=datos["margen_utilidad"],
    )
    db.add(historial)
    db.commit()

    return datos


@app.get("/finanzas/balance-vida-negocio/{usuario_id}")
def obtener_balance_vida_negocio(usuario_id: uuid.UUID, db: Session = Depends(get_db)):
    return calcular_balance_vida_negocio(db, usuario_id)


@app.post("/finanzas/registrar-cobro-cliente")
def registrar_ingreso(
    proyecto_id: uuid.UUID,
    monto: float,
    concepto: str,
    ref: str,
    db: Session = Depends(get_db),
):
    nuevo_ingreso = models.IngresoProyecto(
        proyecto_id=proyecto_id,
        monto=float(monto),
        concepto=concepto,
        referencia_bancaria=ref,
    )
    try:
        db.add(nuevo_ingreso)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "Ingreso registrado correctamente"}
