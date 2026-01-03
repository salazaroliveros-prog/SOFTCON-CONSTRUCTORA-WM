-- Auto-generated schema from SQLAlchemy models
-- Target: Supabase Postgres
-- How to use: open Supabase SQL Editor and run this file

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_pago_enum') THEN
    CREATE TYPE tipo_pago_enum AS ENUM ('jornal', 'destajo');
  END IF;
END$$;


CREATE TABLE insumos_maestro (
	id UUID NOT NULL, 
	tipo VARCHAR NOT NULL, 
	descripcion VARCHAR NOT NULL, 
	unidad_compra VARCHAR NOT NULL, 
	precio_referencial_gtq FLOAT, 
	ultimo_sondeo_ia TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);


CREATE TABLE proyectos (
	id UUID NOT NULL, 
	nombre_proyecto VARCHAR NOT NULL, 
	departamento VARCHAR, 
	PRIMARY KEY (id)
);


CREATE TABLE usuarios (
	id UUID NOT NULL, 
	username VARCHAR(50) NOT NULL, 
	email VARCHAR(100) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	rol VARCHAR(20), 
	is_active BOOLEAN, 
	is_approved BOOLEAN, 
	approved_by_id UUID, 
	approved_at TIMESTAMP WITHOUT TIME ZONE, 
	creado_en TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (username), 
	UNIQUE (email), 
	FOREIGN KEY(approved_by_id) REFERENCES usuarios (id)
);


CREATE TABLE config_retiros (
	usuario_id UUID NOT NULL, 
	tipo_retiro VARCHAR(20), 
	valor FLOAT, 
	PRIMARY KEY (usuario_id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id)
);


CREATE TABLE flujo_caja_consolidado (
	id UUID NOT NULL, 
	proyecto_id UUID, 
	total_ingresos FLOAT, 
	total_egresos_materiales FLOAT, 
	total_egresos_planilla FLOAT, 
	utilidad_bruta FLOAT, 
	margen_porcentual FLOAT, 
	fecha_corte TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(proyecto_id) REFERENCES proyectos (id)
);


CREATE TABLE fotos_bitacora (
	id UUID NOT NULL, 
	proyecto_id UUID, 
	url_foto VARCHAR(255), 
	comentario VARCHAR(500), 
	fecha_registro TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(proyecto_id) REFERENCES proyectos (id)
);


CREATE TABLE gastos_personales (
	id UUID NOT NULL, 
	usuario_id UUID, 
	categoria VARCHAR(50), 
	descripcion VARCHAR(200), 
	monto FLOAT, 
	fecha TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(usuario_id) REFERENCES usuarios (id)
);


CREATE TABLE ingresos_proyecto (
	id UUID NOT NULL, 
	proyecto_id UUID, 
	monto FLOAT NOT NULL, 
	concepto VARCHAR(200), 
	fecha_cobro TIMESTAMP WITHOUT TIME ZONE, 
	referencia_bancaria VARCHAR(100), 
	PRIMARY KEY (id), 
	FOREIGN KEY(proyecto_id) REFERENCES proyectos (id)
);


CREATE TABLE movimientos_bodega (
	id UUID NOT NULL, 
	insumo_id UUID, 
	proyecto_id UUID, 
	tipo_movimiento VARCHAR, 
	cantidad FLOAT NOT NULL, 
	fecha TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(insumo_id) REFERENCES insumos_maestro (id), 
	FOREIGN KEY(proyecto_id) REFERENCES proyectos (id)
);


CREATE TABLE ordenes_compra (
	id UUID NOT NULL, 
	proyecto_id UUID, 
	proveedor_id UUID, 
	fecha_emision TIMESTAMP WITHOUT TIME ZONE, 
	estado VARCHAR, 
	total_oc FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(proyecto_id) REFERENCES proyectos (id)
);


CREATE TABLE presupuesto_renglones (
	id UUID NOT NULL, 
	proyecto_id UUID NOT NULL, 
	descripcion VARCHAR NOT NULL, 
	unidad_medida VARCHAR NOT NULL, 
	cantidad_total FLOAT NOT NULL, 
	costo_unitario_ia FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(proyecto_id) REFERENCES proyectos (id)
);


CREATE TABLE trabajadores (
	id UUID NOT NULL, 
	nombre_completo VARCHAR(200) NOT NULL, 
	dpi VARCHAR(20) NOT NULL, 
	rol VARCHAR(50), 
	tipo_pago tipo_pago_enum, 
	tarifa_base FLOAT, 
	proyecto_actual_id UUID, 
	PRIMARY KEY (id), 
	UNIQUE (dpi), 
	FOREIGN KEY(proyecto_actual_id) REFERENCES proyectos (id)
);


CREATE TABLE apu_composicion (
	id UUID NOT NULL, 
	renglon_id UUID, 
	insumo_id UUID, 
	rendimiento FLOAT NOT NULL, 
	desperdicio FLOAT, 
	precio_aplicado FLOAT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(renglon_id) REFERENCES presupuesto_renglones (id), 
	FOREIGN KEY(insumo_id) REFERENCES insumos_maestro (id)
);


CREATE TABLE asistencia (
	id UUID NOT NULL, 
	trabajador_id UUID, 
	fecha TIMESTAMP WITHOUT TIME ZONE, 
	entrada TIMESTAMP WITHOUT TIME ZONE, 
	salida TIMESTAMP WITHOUT TIME ZONE, 
	latitud_gps FLOAT, 
	longitud_gps FLOAT, 
	gps_check BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(trabajador_id) REFERENCES trabajadores (id)
);


CREATE TABLE detalle_orden_compra (
	id UUID NOT NULL, 
	oc_id UUID, 
	insumo_id UUID, 
	cantidad_pedida FLOAT NOT NULL, 
	precio_unitario_compra FLOAT NOT NULL, 
	subtotal FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(oc_id) REFERENCES ordenes_compra (id), 
	FOREIGN KEY(insumo_id) REFERENCES insumos_maestro (id)
);


CREATE TABLE planilla_pagos (
	id UUID NOT NULL, 
	trabajador_id UUID, 
	proyecto_id UUID, 
	fecha_inicio TIMESTAMP WITHOUT TIME ZONE, 
	fecha_fin TIMESTAMP WITHOUT TIME ZONE, 
	monto_total FLOAT, 
	estado VARCHAR, 
	PRIMARY KEY (id), 
	FOREIGN KEY(trabajador_id) REFERENCES trabajadores (id), 
	FOREIGN KEY(proyecto_id) REFERENCES proyectos (id)
);


CREATE TABLE reportes_avance (
	id UUID NOT NULL, 
	renglon_id UUID, 
	cantidad_avanzada FLOAT NOT NULL, 
	fecha_reporte TIMESTAMP WITHOUT TIME ZONE, 
	comentario VARCHAR(500), 
	latitud_gps FLOAT, 
	longitud_gps FLOAT, 
	usuario_id UUID, 
	PRIMARY KEY (id), 
	FOREIGN KEY(renglon_id) REFERENCES presupuesto_renglones (id)
);


CREATE TABLE fotos_evidencia (
	id UUID NOT NULL, 
	reporte_id UUID, 
	url_foto VARCHAR(255) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(reporte_id) REFERENCES reportes_avance (id)
);
