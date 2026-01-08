import jsPDF from "jspdf";
import "jspdf-autotable";

// Exporta el resultado de APU IA a PDF con logo y formato profesional
export default function exportAPUResultToPDF({ resultado, logoUrl }) {
  if (!resultado) return;
  const renglon = resultado.detalle_ok?.[0] || {};
  const apu = renglon.apu || resultado.apu || resultado.data || {};
  const insumos = apu.insumos || [];

  const doc = new jsPDF();

  // Logo
  if (logoUrl) {
    // Carga la imagen como base64 si es posible
    const img = new Image();
    img.src = logoUrl;
    doc.addImage(img, "JPEG", 10, 10, 30, 30);
  }

  doc.setFontSize(16);
  doc.text("Resumen de APU generado por IA", 50, 20);
  doc.setFontSize(10);
  doc.text(`Renglón: ${renglon.renglon || apu.nombre_renglon || 'N/A'}`, 50, 28);
  doc.text(`Unidad: ${apu.unidad || 'N/A'}`, 50, 34);

  // Tabla de insumos
  doc.autoTable({
    startY: 45,
    head: [["Tipo", "Nombre", "Unidad", "Rendimiento", "Precio (GTQ)"]],
    body: insumos.map(i => [i.tipo, i.nombre, i.unidad, i.rendimiento, i.precio_guate]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [139, 92, 246] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  });

  if (resultado.detalle_fallos?.length > 0) {
    doc.setTextColor(200, 0, 0);
    doc.text(
      `Fallos: ${resultado.detalle_fallos.map(f => f.renglon + ': ' + f.error).join('; ')}`,
      10,
      doc.lastAutoTable.finalY + 10
    );
    doc.setTextColor(0, 0, 0);
  }

  doc.save("APU_IA_SOFTCON.pdf");
}


