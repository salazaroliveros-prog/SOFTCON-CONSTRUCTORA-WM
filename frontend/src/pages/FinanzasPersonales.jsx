import React, { useEffect, useState } from 'react';
import { PlusCircle, Wallet } from 'lucide-react';
import { finanzasPersonalesApi } from '../api/endpoints';
import FormularioGastoPersonal from './FormularioGastoPersonal.jsx';

export default function FinanzasPersonales() {
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState({ ingresos: 0, gastos_lista: [], total_gastos: 0, lista: [] });
  const [gastos] = useState([
    { id: 1, desc: 'Renta Casa', monto: 4500, cat: 'Hogar' },
    { id: 2, desc: 'Supermercado', monto: 2200, cat: 'Alimentación' },
  ]);

  useEffect(() => {
    finanzasPersonalesApi
      .getResumen()
      .then((res) => {
        const payload = res?.data || {};

        // Soportar ambos formatos:
        // - Propuesto: { ingresos, gastos_lista }
        // - Backend actual: { total_gastos, lista }
        const lista = Array.isArray(payload.lista) ? payload.lista : [];
        const gastosLista = Array.isArray(payload.gastos_lista) ? payload.gastos_lista : lista;

        setDatos({
          ingresos: Number(payload.ingresos || 0),
          gastos_lista: gastosLista,
          total_gastos: Number(payload.total_gastos || 0),
          lista,
        });
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al traer finanzas:', err);
        setCargando(false);
      });
  }, []);

  const gastosTabla = (() => {
    const fuente = Array.isArray(datos?.gastos_lista) && datos.gastos_lista.length
      ? datos.gastos_lista
      : Array.isArray(datos?.lista) && datos.lista.length
        ? datos.lista
        : null;

    if (!fuente) return gastos;

    return fuente.map((g) => ({
      id: g.id,
      desc: g.desc ?? g.descripcion ?? '-',
      cat: g.cat ?? g.categoria ?? '-',
      monto: Number(g.monto || 0),
    }));
  })();

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {cargando && <p className="p-2 text-center text-slate-400">Conectando con la base de datos...</p>}

      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <h2 className="text-3xl font-black text-white tracking-tight mb-1">Finanzas del Dueño</h2>
        <button
          type="button"
          onClick={() => setMostrarFormulario((v) => !v)}
          className="flex items-center gap-2 bg-yellow-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition"
        >
          <PlusCircle size={20} />
          <span>{mostrarFormulario ? 'Ocultar Formulario' : 'Registrar Gasto Personal'}</span>
        </button>
      </div>

      <div className="bg-slate-900/80 text-yellow-200 p-6 rounded-2xl mb-8 shadow-lg flex items-center justify-between border border-white/10">
        <div>
          <p className="text-yellow-300 text-sm uppercase font-bold tracking-widest">Saldo Neto Disponible</p>
          <p className="text-4xl font-black mt-1 text-white">
            Q {(Number(datos?.ingresos || 0) - Number(datos?.total_gastos || 0)).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <Wallet size={48} className="text-yellow-400 opacity-60" />
      </div>

      <div className="bg-slate-900/80 rounded-xl shadow-lg overflow-hidden border border-white/10">
        <table className="w-full text-left">
          <thead className="bg-slate-800 border-b border-white/10 text-yellow-300 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {gastosTabla.map((g) => (
              <tr key={g.id} className="hover:bg-slate-800/40">
                <td className="px-6 py-4 font-medium text-white">{g.desc}</td>
                <td className="px-6 py-4 text-yellow-200">{g.cat}</td>
                <td className="px-6 py-4 text-right font-bold text-red-400">Q {g.monto.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-slate-400">Registra tus gastos personales (requiere sesión con JWT).</p>

      {mostrarFormulario && (
        <div className="mt-6">
          <FormularioGastoPersonal />
        </div>
      )}
    </div>
  );
}
