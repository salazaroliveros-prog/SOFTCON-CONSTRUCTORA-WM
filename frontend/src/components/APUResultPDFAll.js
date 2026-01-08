import jsPDF from "jspdf";
import "jspdf-autotable";

// Exporta todos los renglones del resultado de APU IA a PDF con logo y formato profesional
export default function exportAllAPUResultsToPDF({ resultado, logoUrl, fileName }) {
  if (!resultado) return;
  const renglones = resultado.detalle_ok || [];

  const doc = new jsPDF();

  // Logo
  if (logoUrl) {
    const img = new Image();
    img.src = logoUrl;
    doc.addImage(img, "JPEG", 10, 10, 30, 30);
  }

  doc.setFontSize(16);
  doc.text("Resumen de APUs generados por IA", 50, 20);
  doc.setFontSize(10);

  let y = 45;
  renglones.forEach((renglon, idx) => {
    const apu = renglon.apu || renglon || {};
    const insumos = apu.insumos || [];
    doc.setFontSize(12);
    doc.text(`Renglón: ${renglon.renglon || apu.nombre_renglon || 'N/A'}`, 10, y);
    doc.setFontSize(10);
    doc.text(`Unidad: ${apu.unidad || 'N/A'}`, 120, y);
    y += 6;
    doc.autoTable({
      startY: y,
      head: [["Tipo", "Nombre", "Unidad", "Rendimiento", "Precio (GTQ)"]],
      body: insumos.map(i => [i.tipo, i.nombre, i.unidad, i.rendimiento, i.precio_guate]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [139, 92, 246] },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      margin: { left: 10, right: 10 },
    });
    y = doc.lastAutoTable.finalY + 10;
    if (y > 250 && idx < renglones.length - 1) {
      doc.addPage();
      y = 20;
    }
  });

  if (resultado.detalle_fallos?.length > 0) {
    doc.setTextColor(200, 0, 0);
    doc.text(
      `Fallos: ${resultado.detalle_fallos.map(f => f.renglon + ': ' + f.error).join('; ')}`,
      10,
      y
    );
    doc.setTextColor(0, 0, 0);
  }

  doc.save(fileName || "APUs_IA_SOFTCON.pdf");
}
