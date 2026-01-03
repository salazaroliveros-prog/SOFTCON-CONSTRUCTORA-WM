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
    <div className="max-w-4xl">
      {cargando && <p className="p-2 text-center text-slate-500">Conectando con la base de datos...</p>}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Finanzas del Dueño</h2>
        <button
          type="button"
          onClick={() => setMostrarFormulario((v) => !v)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          <span>{mostrarFormulario ? 'Ocultar Formulario' : 'Registrar Gasto Personal'}</span>
        </button>
      </div>

      <div className="bg-indigo-900 text-white p-6 rounded-2xl mb-8 shadow-lg flex items-center justify-between">
        <div>
          <p className="text-indigo-200 text-sm uppercase font-bold tracking-widest">Saldo Neto Disponible</p>
          <p className="text-4xl font-black mt-1">
            Q {(Number(datos?.ingresos || 0) - Number(datos?.total_gastos || 0)).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <Wallet size={48} className="text-indigo-400 opacity-50" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gastosTabla.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{g.desc}</td>
                <td className="px-6 py-4 text-gray-500">{g.cat}</td>
                <td className="px-6 py-4 text-right font-bold text-red-500">Q {g.monto.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-slate-600">Registra tus gastos personales (requiere sesión con JWT).</p>

      {mostrarFormulario && (
        <div className="mt-6">
          <FormularioGastoPersonal />
        </div>
      )}
    </div>
  );
}
