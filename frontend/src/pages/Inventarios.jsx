import React, { useEffect, useState } from 'react';
import { inventarioApi } from '../api/endpoints';

export default function Inventarios() {
  const [materiales, setMateriales] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar materiales (proyectoId puede venir de props/context, aquí hardcodeado a 1)
  useEffect(() => {
    setLoading(true);
    inventarioApi.getMateriales(1)
      .then(res => setMateriales(res.data || []))
      .catch(() => setError('Error al cargar inventario'))
      .finally(() => setLoading(false));
  }, []);

  // Filtrado de materiales
  const materialesFiltrados = materiales.filter(m =>
    m.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Encabezado de Página: Título y Acciones principales */}
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white">📦 Inventario en Obra</h1>
          <p className="text-slate-400">Control de materiales y suministros.</p>
        </div>
        <button className="bg-softcon-primary text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition">
          + Agregar Material
        </button>
      </div>

      {/* 2. Cuerpo: Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Inventario (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex justify-end p-4">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Buscar material..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-full text-white outline-none focus:ring-2 focus:ring-softcon-secondary"
              />
              <span className="absolute left-3 top-2.5 text-slate-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35m1.1-4.4a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-700/50 text-slate-300 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8 text-slate-400">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={3} className="text-center py-8 text-red-400">{error}</td></tr>
              ) : materialesFiltrados.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-slate-400">No hay materiales</td></tr>
              ) : (
                materialesFiltrados.map(mat => (
                  <tr key={mat.id} className="hover:bg-slate-700/30 cursor-pointer" onClick={() => setMaterialSeleccionado(mat)}>
                    <td className="px-6 py-4 font-medium">{mat.descripcion}</td>
                    <td className="px-6 py-4">{mat.cantidad}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${mat.cantidad < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {mat.cantidad < 10 ? 'Stock Bajo' : 'Suficiente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario de ajuste rápido (Ocupa 1 columna) */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 h-fit">
          <h3 className="text-white font-bold mb-4">Ajuste de Stock</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-white">Material</label>
              <input
                type="text"
                value={materialSeleccionado?.descripcion || ''}
                placeholder="Selecciona un material de la tabla"
                readOnly
                className="w-full bg-slate-900/50 border border-white/10 p-3 rounded-xl text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-white">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                placeholder="Cantidad"
                className="w-full bg-slate-900/50 border border-white/10 p-3 rounded-xl text-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" className="text-slate-400 font-bold px-4 py-2 rounded-xl" onClick={() => { setMaterialSeleccionado(null); setCantidad(''); }}>Cancelar</button>
              <button type="button" className="bg-softcon-primary text-black font-bold px-4 py-2 rounded-xl hover:scale-105 transition">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}