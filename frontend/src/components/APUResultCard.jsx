import React, { useState } from "react";
import exportAPUResultToPDF from "./APUResultPDF";
import exportAllAPUResultsToPDF from "./APUResultPDFAll";

export default function APUResultCard({ resultado, logoUrl }) {
  const [fileName, setFileName] = useState("APUs_IA_SOFTCON.pdf");
  const [selectedRows, setSelectedRows] = useState([]);
  if (!resultado) return null;

  // Estructura esperada: { status, detalle_ok, detalle_fallos, ... }
  const renglones = resultado.detalle_ok || [];
  // Mostramos solo el primer renglón generado como ejemplo
  const renglon = renglones[0] || {};
  const apu = renglon.apu || resultado.apu || resultado.data || {};
  const insumos = apu.insumos || [];

  // Exportar todos los renglones
  const handleExportAll = () => {
    exportAllAPUResultsToPDF({ resultado, logoUrl, fileName });
  };

  // Exportar renglones seleccionados
  const handleExportSelected = () => {
    if (selectedRows.length === 0) return;
    const parcial = { ...resultado, detalle_ok: renglones.filter((_, idx) => selectedRows.includes(idx)) };
    exportAllAPUResultsToPDF({ resultado: parcial, logoUrl, fileName });
  };

  const toggleRow = idx => {
    setSelectedRows(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto mt-4">
      <div className="flex items-center gap-4 mb-4">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-14 w-14 object-contain rounded-lg border border-gray-100 shadow" />
        )}
        <div className="flex flex-col gap-1 flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Resumen de APUs generados por IA</h2>
          <p className="text-xs text-gray-400">Puede seleccionar renglones para exportar solo los deseados.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-end ml-auto mt-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 text-xs w-48"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            placeholder="Nombre del archivo PDF"
          />
          <button
            className="bg-[#8b5cf6] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-[#7c3aed] transition"
            onClick={handleExportAll}
          >
            Exportar todos a PDF
          </button>
          <button
            className="bg-[#facc15] text-black px-3 py-1.5 rounded-lg text-xs font-semibold shadow hover:bg-yellow-400 transition"
            onClick={handleExportSelected}
            disabled={selectedRows.length === 0}
          >
            Exportar seleccionados a PDF
          </button>
        </div>
      </div>
      {/* Tabla de renglones con selección */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-xs text-left border-t border-b border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2"></th>
              <th className="px-3 py-2 font-semibold text-gray-700">Renglón</th>
              <th className="px-3 py-2 font-semibold text-gray-700">Unidad</th>
              <th className="px-3 py-2 font-semibold text-gray-700"># Insumos</th>
              <th className="px-3 py-2 font-semibold text-gray-700">Ver detalle</th>
            </tr>
          </thead>
          <tbody>
            {renglones.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-4">Sin renglones</td></tr>
            ) : (
              renglones.map((r, idx) => {
                const apuR = r.apu || r || {};
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(idx)}
                        onChange={() => toggleRow(idx)}
                        aria-label="Seleccionar renglón"
                      />
                    </td>
                    <td className="px-3 py-2">{r.renglon || apuR.nombre_renglon || 'N/A'}</td>
                    <td className="px-3 py-2">{apuR.unidad || 'N/A'}</td>
                    <td className="px-3 py-2 text-center">{(apuR.insumos || []).length}</td>
                    <td className="px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:underline">Ver</summary>
                        <table className="mt-2 border text-xs">
                          <thead>
                            <tr>
                              <th className="px-2">Tipo</th>
                              <th className="px-2">Nombre</th>
                              <th className="px-2">Unidad</th>
                              <th className="px-2">Rendimiento</th>
                              <th className="px-2">Precio (GTQ)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(apuR.insumos || []).map((insumo, i) => (
                              <tr key={i}>
                                <td className="px-2">{insumo.tipo}</td>
                                <td className="px-2">{insumo.nombre}</td>
                                <td className="px-2">{insumo.unidad}</td>
                                <td className="px-2 text-right">{insumo.rendimiento}</td>
                                <td className="px-2 text-right">{insumo.precio_guate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </details>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {resultado.detalle_fallos?.length > 0 && (
        <div className="mt-4 text-xs text-red-500">
          <strong>Fallos:</strong> {resultado.detalle_fallos.map(f => f.renglon + ': ' + f.error).join('; ')}
        </div>
      )}
    </div>
  );
}
