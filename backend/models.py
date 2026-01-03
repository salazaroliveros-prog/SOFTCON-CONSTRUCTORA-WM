from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base
from sqlalchemy.orm import relationship
import uuid
import datetime
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"  # Acceso total
    SUPERVISOR = "supervisor"  # Campo, Planilla y Reportes
    BODEGUERO = "bodeguero"  # Compras e Inventarios
    TRABAJADOR = "trabajador"  # Solo asistencia

class Proyecto(Base):
    __tablename__ = "proyectos"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_proyecto = Column(String, nullable=False)
    departamento = Column(String)


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    rol = Column(String(20), default=UserRole.TRABAJADOR.value)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    approved_by_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    creado_en = Column(DateTime, default=datetime.datetime.utcnow)

class GastoPersonal(Base):
    __tablename__ = "gastos_personales"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    categoria = Column(String(50))
    descripcion = Column(String(200))
    monto = Column(Float)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)


class ConfiguracionRetiro(Base):
    """Define cuánto dinero retiras de las utilidades de la empresa"""

    __tablename__ = "config_retiros"
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), primary_key=True)
    tipo_retiro = Column(String(20))  # "fijo" o "porcentaje"
    valor = Column(Float)


class MovimientoBodega(Base):
    __tablename__ = "movimientos_bodega"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    insumo_id = Column(UUID(as_uuid=True), ForeignKey("insumos_maestro.id"))
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"))
    tipo_movimiento = Column(String)  # "ENTRADA" (Compra) o "SALIDA" (Uso en obra)
    cantidad = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

    insumo = relationship("InsumoMaestro")
    proyecto = relationship("Proyecto")


class InsumoMaestro(Base):
    __tablename__ = "insumos_maestro"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tipo = Column(String, nullable=False)  # material, mano_obra, equipo
    descripcion = Column(String, nullable=False)
    unidad_compra = Column(String, nullable=False)
    precio_referencial_gtq = Column(Float, default=0.0)
    ultimo_sondeo_ia = Column(DateTime, default=datetime.datetime.utcnow)


class PresupuestoRenglon(Base):
    __tablename__ = "presupuesto_renglones"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    descripcion = Column(String, nullable=False)
    unidad_medida = Column(String, nullable=False)
    cantidad_total = Column(Float, nullable=False)
    costo_unitario_ia = Column(Float, default=0.0)

    composicion = relationship(
        "APUComposicion",
        back_populates="renglon",
        cascade="all, delete-orphan",
    )


class APUComposicion(Base):
    __tablename__ = "apu_composicion"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    renglon_id = Column(UUID(as_uuid=True), ForeignKey("presupuesto_renglones.id"))
    insumo_id = Column(UUID(as_uuid=True), ForeignKey("insumos_maestro.id"))
    rendimiento = Column(Float, nullable=False)
    desperdicio = Column(Float, default=1.05)
    precio_aplicado = Column(Float, nullable=False)

    renglon = relationship("PresupuestoRenglon", back_populates="composicion")
    insumo = relationship("InsumoMaestro")


class ReporteAvance(Base):
    __tablename__ = "reportes_avance"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    renglon_id = Column(UUID(as_uuid=True), ForeignKey("presupuesto_renglones.id"))
    cantidad_avanzada = Column(Float, nullable=False)  # Ej: 15.5 m2
    fecha_reporte = Column(DateTime, default=datetime.datetime.utcnow)
    comentario = Column(String(500))
    latitud_gps = Column(Float)
    longitud_gps = Column(Float)
    usuario_id = Column(UUID(as_uuid=True))

    renglon = relationship("PresupuestoRenglon")
    fotos = relationship("FotoEvidencia", back_populates="reporte")


class FotoEvidencia(Base):
    __tablename__ = "fotos_evidencia"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporte_id = Column(UUID(as_uuid=True), ForeignKey("reportes_avance.id"))
    url_foto = Column(String(255), nullable=False)

    reporte = relationship("ReporteAvance", back_populates="fotos")


class FotoBitacora(Base):
    __tablename__ = "fotos_bitacora"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"))
    url_foto = Column(String(255))  # URL de Supabase Storage o S3
    comentario = Column(String(500))
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)

    proyecto = relationship("Proyecto")


class OrdenCompra(Base):
    __tablename__ = "ordenes_compra"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"))
    proveedor_id = Column(UUID(as_uuid=True), nullable=True)
    fecha_emision = Column(DateTime, default=datetime.datetime.utcnow)
    estado = Column(String, default="pendiente")
    total_oc = Column(Float, default=0.0)


class DetalleOrdenCompra(Base):
    __tablename__ = "detalle_orden_compra"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    oc_id = Column(UUID(as_uuid=True), ForeignKey("ordenes_compra.id"))
    insumo_id = Column(UUID(as_uuid=True), ForeignKey("insumos_maestro.id"))
    cantidad_pedida = Column(Float, nullable=False)
    precio_unitario_compra = Column(Float, nullable=False)
    subtotal = Column(Float)

    oc = relationship("OrdenCompra")
    insumo = relationship("InsumoMaestro")


class Trabajador(Base):
    __tablename__ = "trabajadores"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_completo = Column(String(200), nullable=False)
    dpi = Column(String(20), unique=True, nullable=False)
    rol = Column(String(50))
    tipo_pago = Column(Enum("jornal", "destajo", name="tipo_pago_enum"))
    tarifa_base = Column(Float)
    proyecto_actual_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"))


class RegistroAsistencia(Base):
    __tablename__ = "asistencia"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trabajador_id = Column(UUID(as_uuid=True), ForeignKey("trabajadores.id"))
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    entrada = Column(DateTime)
    salida = Column(DateTime)
    latitud_gps = Column(Float)
    longitud_gps = Column(Float)
    gps_check = Column(Boolean, default=False)


class PagoPlanilla(Base):
    __tablename__ = "planilla_pagos"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trabajador_id = Column(UUID(as_uuid=True), ForeignKey("trabajadores.id"))
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"))
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    monto_total = Column(Float)
    estado = Column(String, default="pendiente")


class IngresoProyecto(Base):
    __tablename__ = "ingresos_proyecto"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"))
    monto = Column(Float, nullable=False)
    concepto = Column(String(200))
    fecha_cobro = Column(DateTime, default=datetime.datetime.utcnow)
    referencia_bancaria = Column(String(100))


class FlujoCajaConsolidado(Base):
    __tablename__ = "flujo_caja_consolidado"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"))
    total_ingresos = Column(Float, default=0.0)
    total_egresos_materiales = Column(Float, default=0.0)
    total_egresos_planilla = Column(Float, default=0.0)
    utilidad_bruta = Column(Float, default=0.0)
    margen_porcentual = Column(Float, default=0.0)
    fecha_corte = Column(DateTime, default=datetime.datetime.utcnow)