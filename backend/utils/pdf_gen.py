from __future__ import annotations

import os
import pathlib
import re
import uuid
import datetime
from typing import Any

from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas


def _safe_name(value: str) -> str:
    value = (value or "").strip()
    value = re.sub(r"[^A-Za-z0-9\-_ ]+", "", value)
    value = value.replace(" ", "_")
    return value[:60] if value else "Proyecto"


def _find_logo_path(*, explicit_path: str | pathlib.Path | None = None) -> pathlib.Path | None:
    if explicit_path:
        p = pathlib.Path(explicit_path).expanduser()
        if p.exists():
            return p

    # Permite override por variable de entorno.
    env_raw = os.getenv("PDF_LOGO_PATH", "")
    if env_raw:
        env_path = pathlib.Path(env_raw).expanduser()
        if env_path.exists():
            return env_path

    # Busca en ubicaciones típicas del repo.
    # - <repo>/assets/LOGO_CONSTRUCTORA_icono.jpg
    # - <repo>/backend/assets/LOGO_CONSTRUCTORA_icono.jpg
    # - <repo>/frontend/src/assets/LOGO_CONSTRUCTORA_icono.jpg
    here = pathlib.Path(__file__).resolve()
    backend_dir = here.parents[1]
    repo_root = backend_dir.parent

    candidates = [
        repo_root / "assets" / "LOGO_CONSTRUCTORA_icono.jpg",
        backend_dir / "assets" / "LOGO_CONSTRUCTORA_icono.jpg",
        repo_root / "frontend" / "src" / "assets" / "LOGO_CONSTRUCTORA_icono.jpg",
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


def generar_documento_oficial(
    tipo: str,
    datos: dict[str, Any],
    *,
    output_dir: str | pathlib.Path | None = None,
    logo_path: str | pathlib.Path | None = None,
) -> str:
    """Genera un PDF con formato de documento oficial.

    `tipo`: por ejemplo "PRESUPUESTO" u "ORDEN_COMPRA".
    `datos` admite:
      - id: identificador (opcional)
      - fecha: string (opcional)
      - proyecto_nombre: string (opcional)
      - items: lista[{descripcion, total}] (opcional)

    Retorna la ruta del archivo generado.
    """

    tipo_norm = (tipo or "DOCUMENTO").strip().upper()
    doc_id = datos.get("id")
    doc_id_str = str(doc_id) if doc_id is not None and str(doc_id).strip() else uuid.uuid4().hex[:8]
    filename = f"{_safe_name(tipo_norm)}_{_safe_name(doc_id_str)}.pdf"
    out_path = pathlib.Path(output_dir).resolve() / filename if output_dir else pathlib.Path(filename)

    try:
        out_path.parent.mkdir(parents=True, exist_ok=True)
    except Exception:
        # Si no se puede crear el directorio, dejar que falle el save con error claro.
        pass

    c = canvas.Canvas(str(out_path), pagesize=LETTER)

    logo = _find_logo_path(explicit_path=logo_path)

    def header(page_num: int) -> int:
        # Encabezado con logo + marca
        header_top_y = 770
        logo_x = 50
        logo_y = 705
        logo_w = 80
        logo_h = 80
        brand_x = 150

        logo_drawn = False
        if logo is not None:
            try:
                c.drawImage(
                    ImageReader(str(logo)),
                    logo_x,
                    logo_y,
                    width=logo_w,
                    height=logo_h,
                    preserveAspectRatio=True,
                    mask="auto",
                )
                logo_drawn = True
            except Exception:
                pass

        c.setFont("Helvetica-Bold", 16)
        c.drawString(brand_x if logo_drawn else 50, 750, "SOFTCON-MYS-CONSTRU-WM")
        c.setFont("Helvetica", 10)
        c.drawString(brand_x if logo_drawn else 50, 735, "CONSTRUYENDO TU FUTURO")

        # Página
        c.setFont("Helvetica", 10)
        c.drawRightString(560, header_top_y, f"Página {page_num}")

        # Línea decorativa dorada
        c.setStrokeColor(colors.HexColor("#B8860B"))
        c.setLineWidth(1)
        c.line(50, 690, 550, 690)

        # Cuerpo (cabecera del documento)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 660, f"DOCUMENTO: {tipo_norm}")

        fecha = datos.get("fecha")
        if not isinstance(fecha, str) or not fecha.strip():
            fecha = datetime.datetime.utcnow().date().isoformat()
        proyecto_nombre = (
            datos.get("proyecto_nombre")
            or datos.get("nombre")
            or datos.get("proyecto")
            or ""
        )

        c.setFont("Helvetica", 10)
        c.drawString(50, 645, f"Fecha: {fecha}")
        c.drawString(50, 630, f"Proyecto: {proyecto_nombre}")

        # Cabecera de tabla
        y = 600
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, y, "DESCRIPCIÓN")
        c.drawRightString(550, y, "TOTAL (Q)")
        c.setLineWidth(0.8)
        c.line(50, y - 5, 550, y - 5)
        return y - 25

    def footer() -> None:
        c.setFont("Helvetica-Oblique", 8)
        c.drawCentredString(
            300,
            50,
            "Sistema generado por SOFTCON-MYS-CONSTRU-WM - Todos los derechos reservados.",
        )

    items = datos.get("items")
    if not isinstance(items, list):
        items = []

    page = 1
    y = header(page)

    c.setFont("Helvetica", 10)
    for item in items:
        if not isinstance(item, dict):
            continue
        descripcion = str(item.get("descripcion") or "")
        total = item.get("total")
        try:
            total_num = float(total or 0)
        except Exception:
            total_num = 0.0

        # Multi-línea simple para descripciones largas
        max_chars = 80
        lines = [descripcion[i : i + max_chars] for i in range(0, len(descripcion), max_chars)] or [""]
        for idx, line in enumerate(lines):
            c.drawString(50, y, line)
            if idx == 0:
                c.drawRightString(550, y, f"Q{total_num:,.2f}")
            y -= 14

        y -= 4
        if y < 80:
            footer()
            c.showPage()
            page += 1
            y = header(page)
            c.setFont("Helvetica", 10)

    footer()
    c.save()
    return str(out_path)


def generar_pdf_presupuesto(
    datos_proyecto: dict[str, Any],
    *,
    output_dir: str | pathlib.Path | None = None,
) -> str:
    """Genera un PDF simple del presupuesto.

    - Si `output_dir` se provee, guarda el archivo allí.
    - Retorna la ruta del archivo generado (string).
    """

    nombre = str(datos_proyecto.get("nombre") or "Proyecto")
    departamento = str(datos_proyecto.get("departamento") or "")
    renglones = datos_proyecto.get("renglones")
    if not isinstance(renglones, list):
        renglones = []

    return generar_documento_oficial(
        "PRESUPUESTO",
        {
            "id": uuid.uuid4().hex[:8],
            "fecha": datetime.datetime.utcnow().date().isoformat(),
            "proyecto_nombre": nombre,
            "items": [
                {
                    "descripcion": str(r.get("descripcion") or ""),
                    "total": r.get("total"),
                }
                for r in renglones
                if isinstance(r, dict)
            ],
            "departamento": departamento,
        },
        output_dir=output_dir,
    )


def generar_pdf_presupuesto_profesional(
    datos_proyecto: dict[str, Any],
    *,
    output_dir: str | pathlib.Path | None = None,
    logo_ms_path: str | pathlib.Path | None = None,
    logo_wm_path: str | pathlib.Path | None = None,
) -> str:
    """Genera un informe profesional (tabla) del presupuesto por fases.

    Espera `datos_proyecto` con:
      - nombre
      - departamento
      - fecha (opcional)
      - renglones: lista[{descripcion, unidad, cantidad, precio_unitario, total, fase?}]
    """

    nombre = str(datos_proyecto.get("nombre") or "Proyecto")
    departamento = str(datos_proyecto.get("departamento") or "")
    fecha = datos_proyecto.get("fecha")
    if not isinstance(fecha, str) or not fecha.strip():
        fecha = datetime.datetime.utcnow().date().isoformat()

    renglones = datos_proyecto.get("renglones")
    if not isinstance(renglones, list):
        renglones = []

    ms_logo = _find_logo_path(explicit_path=logo_ms_path) or _find_logo_path()
    wm_logo = _find_logo_path(explicit_path=logo_wm_path)

    filename = f"Informe_Presupuesto_{_safe_name(nombre)}_{uuid.uuid4().hex[:8]}.pdf"
    out_path = pathlib.Path(output_dir).resolve() / filename if output_dir else pathlib.Path(filename)
    try:
        out_path.parent.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass

    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=LETTER,
        leftMargin=0.55 * inch,
        rightMargin=0.55 * inch,
        topMargin=1.35 * inch,
        bottomMargin=0.7 * inch,
        title=f"Presupuesto - {nombre}",
        author="SOFTCON-MYS-CONSTRU-WM",
    )

    styles = getSampleStyleSheet()
    story: list[Any] = []

    story.append(Paragraph(f"<b>PROYECTO:</b> {nombre}", styles["Normal"]))
    story.append(Paragraph(f"<b>UBICACIÓN:</b> {departamento}, Guatemala", styles["Normal"]))
    story.append(Paragraph(f"<b>FECHA DE EMISIÓN:</b> {fecha}", styles["Normal"]))
    story.append(Spacer(1, 0.25 * inch))

    # --- Tabla ---
    table_data: list[list[str]] = [["FASE / RENGLÓN", "UNIDAD", "CANT.", "P. UNIT (Q)", "TOTAL (Q)"]]
    row_styles: list[tuple] = []

    # Agrupar por fase (si viene), sino intentar inferir por "Fase - Renglón".
    grouped: dict[str, list[dict[str, Any]]] = {}
    order: list[str] = []
    for r in renglones:
        if not isinstance(r, dict):
            continue

        fase = str(r.get("fase") or "").strip()
        desc = str(r.get("descripcion") or "").strip()
        if not fase and " - " in desc:
            fase, _ = desc.split(" - ", 1)
            fase = str(fase).strip()

        if not fase:
            fase = "OTROS"

        if fase not in grouped:
            grouped[fase] = []
            order.append(fase)
        grouped[fase].append(r)

    total_directo = 0.0
    for fase in order:
        table_data.append([fase.upper(), "", "", "", ""])
        phase_row_idx = len(table_data) - 1
        row_styles.extend(
            [
                ("BACKGROUND", (0, phase_row_idx), (-1, phase_row_idx), colors.HexColor("#EDF2F7")),
                ("FONTNAME", (0, phase_row_idx), (-1, phase_row_idx), "Helvetica-Bold"),
                ("ALIGN", (0, phase_row_idx), (-1, phase_row_idx), "LEFT"),
            ]
        )

        for r in grouped.get(fase, []):
            desc = str(r.get("descripcion") or "")
            # Si venía "Fase - Renglón", mostrar solo el renglón dentro de la fase.
            if " - " in desc:
                _, desc2 = desc.split(" - ", 1)
                desc = desc2.strip()

            unidad = str(r.get("unidad") or "")
            try:
                cant = float(r.get("cantidad") or 0)
            except Exception:
                cant = 0.0
            try:
                punit = float(r.get("precio_unitario") or 0)
            except Exception:
                punit = 0.0
            try:
                total = float(r.get("total") or (cant * punit))
            except Exception:
                total = cant * punit

            total_directo += float(total or 0)

            table_data.append(
                [
                    f"   {desc}",
                    unidad,
                    f"{cant:,.2f}",
                    f"{punit:,.2f}",
                    f"{total:,.2f}",
                ]
            )

    table_data.append(["TOTAL COSTO DIRECTO", "", "", "", f"Q {total_directo:,.2f}"])
    total_row_idx = len(table_data) - 1
    row_styles.extend(
        [
            ("BACKGROUND", (0, total_row_idx), (-1, total_row_idx), colors.HexColor("#F7FAFC")),
            ("FONTNAME", (0, total_row_idx), (-1, total_row_idx), "Helvetica-Bold"),
        ]
    )

    table = Table(
        table_data,
        colWidths=[2.9 * inch, 0.7 * inch, 0.7 * inch, 1.05 * inch, 1.05 * inch],
        repeatRows=1,
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2D3748")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("TOPPADDING", (0, 0), (-1, 0), 10),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("ALIGN", (0, 1), (0, -1), "LEFT"),
                ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E0")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
            + row_styles
        )
    )

    story.append(table)
    story.append(Spacer(1, 0.25 * inch))

    def _on_page(canv: canvas.Canvas, doc_obj: Any) -> None:
        # Encabezado corporativo
        canv.saveState()
        canv.setFillColor(colors.HexColor("#1A202C"))

        if ms_logo is not None:
            try:
                canv.drawImage(
                    ImageReader(str(ms_logo)),
                    doc.leftMargin,
                    LETTER[1] - 0.95 * inch,
                    width=0.65 * inch,
                    height=0.65 * inch,
                    preserveAspectRatio=True,
                    mask="auto",
                )
            except Exception:
                pass

        if wm_logo is not None:
            try:
                canv.drawImage(
                    ImageReader(str(wm_logo)),
                    LETTER[0] - doc.rightMargin - 0.65 * inch,
                    LETTER[1] - 0.95 * inch,
                    width=0.65 * inch,
                    height=0.65 * inch,
                    preserveAspectRatio=True,
                    mask="auto",
                )
            except Exception:
                pass

        canv.setFont("Helvetica-Bold", 18)
        canv.drawString(doc.leftMargin + 0.75 * inch, LETTER[1] - 0.72 * inch, "SOFTCON-MYS-CONSTRU-WM")
        canv.setFont("Helvetica-Oblique", 10)
        canv.setFillColor(colors.HexColor("#B8860B"))
        canv.drawString(doc.leftMargin + 0.75 * inch, LETTER[1] - 0.88 * inch, '"CONSTRUYENDO TU FUTURO"')

        # Línea divisoria
        canv.setStrokeColor(colors.HexColor("#B8860B"))
        canv.setLineWidth(2)
        canv.line(doc.leftMargin, LETTER[1] - 1.05 * inch, LETTER[0] - doc.rightMargin, LETTER[1] - 1.05 * inch)

        # Pie de página
        canv.setFillColor(colors.black)
        canv.setFont("Helvetica-Oblique", 8)
        canv.drawCentredString(
            LETTER[0] / 2,
            0.45 * inch,
            "Sistema generado por SOFTCON-MYS-CONSTRU-WM - Todos los derechos reservados.",
        )

        # Página
        canv.setFont("Helvetica", 9)
        canv.drawRightString(LETTER[0] - doc.rightMargin, 0.45 * inch, f"Página {doc_obj.page}")
        canv.restoreState()

    doc.build(story, onFirstPage=_on_page, onLaterPages=_on_page)
    return str(out_path)