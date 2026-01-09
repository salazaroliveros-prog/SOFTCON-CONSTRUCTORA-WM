
import React from 'react';

export default function BitacoraMapa({ reportes }) {
  const items = Array.isArray(reportes) ? reportes : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 px-10">
      {/* Lista de Fotos */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="font-black mb-3 text-slate-800">Últimas Evidencias de Campo</h3>
        <div className="grid grid-cols-3 gap-2">
          {items.map((rep) => (
            <img
              key={rep.id}
              src={rep.url_foto}
              alt="Evidencia"
              className="rounded-lg h-[110px] w-full object-cover border border-slate-200"
            />
          ))}
          {items.length === 0 && (
            <div className="col-span-3 text-slate-400">No hay evidencias todavía.</div>
          )}
        </div>
      </div>
      {/* Mapa de Ubicación (Concepto) */}
      <div className="bg-white p-4 rounded-xl shadow-md border-2 border-dashed border-slate-300 min-h-[230px] flex items-center justify-center">
        <p className="text-slate-400 text-center leading-relaxed">
          [Integración Google Maps API]
          <br />
          Puntos de GPS marcados en tiempo real según reportes de asistencia.
        </p>
      </div>
    </div>
  );
}
