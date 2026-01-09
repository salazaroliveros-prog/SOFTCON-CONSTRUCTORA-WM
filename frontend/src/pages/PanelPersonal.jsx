
import React from 'react';

export default function PanelPersonal({ datosPersonales }) {
  const d = datosPersonales || {};
  const ingreso = Number(d.ingreso_disponible_empresa || 0);
  const gastos = Number(d.gastos_personales_totales || 0);
  const ahorro = Number(d.ahorro_neto_del_mes || 0);

  return (
    <div className="mt-6 mx-10 p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
      <h2 className="text-lg font-black mb-3">Balance Personal (Caja del Dueño)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl">
          <p className="text-xs text-violet-300 font-bold uppercase">Ingreso desde utilidades</p>
          <p className="text-2xl font-black">Q{ingreso.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl">
          <p className="text-xs text-violet-300 font-bold uppercase">Gastos hogar / personal</p>
          <p className="text-2xl font-black text-red-400">Q{gastos.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl">
          <p className="text-xs text-slate-900 font-black uppercase">Ahorro neto real</p>
          <p className={`text-2xl font-black ${ahorro >= 0 ? 'text-green-600' : 'text-red-600'}`}>Q{ahorro.toFixed(2)}</p>
        </div>
      </div>
      {ahorro < 0 && (
        <div className="mt-3 p-2 bg-red-600 text-center rounded-lg text-xs font-black">
          TUS GASTOS PERSONALES SUPERAN TUS DIVIDENDOS DE OBRA
        </div>
      )}
    </div>
  );
}
