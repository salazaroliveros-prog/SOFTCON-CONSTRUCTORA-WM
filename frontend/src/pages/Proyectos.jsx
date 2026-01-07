import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Plus, Search, HardHat, Calendar, DollarSign } from 'lucide-react';
import api from '../api';
// Ejemplo de formulario visualmente ordenado con Tailwind
function FormularioEjemplo() {
  return (
    <div className="max-w-lg mx-auto bg-slate-900/80 p-8 rounded-2xl shadow-2xl border border-white/10 space-y-6">
      <h2 className="text-2xl font-black text-softcon-primary mb-4">Nuevo Proyecto</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1 text-white">Nombre del Proyecto</label>
          <input className="input-field" placeholder="Ej: Edificio Central" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-white">Cliente</label>
          <input className="input-field" placeholder="Ej: SOFTCON S.A." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-white">Presupuesto</label>
            <input className="input-field" type="number" placeholder="GTQ" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-white">Fecha de Inicio</label>
            <input className="input-field" type="date" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-access">Crear Proyecto</button>
          <button type="button" className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Plus, Search, HardHat, Calendar, DollarSign } from 'lucide-react';
import api from '../api';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/proyectos/');
      setProyectos(response.data);
    } catch (error) {
      console.error("Error al cargar proyectos de SOFTCON-WM:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            GESTIÓN DE <span className="text-softcon-primary">PROYECTOS</span>
          </h1>
          <p className="text-slate-400 mt-1 font-medium">CONSTRUYENDO TU FUTURO</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-[#8b5cf6] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-[#8b5cf6] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={20} />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-[#facc15] text-black font-bold px-5 py-2.5 rounded-xl hover:scale-105 transition shadow-lg shadow-[0_4px_20px_#facc15]/20">
            <Plus size={20} /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, ubicación o cliente..." 
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-softcon-secondary outline-none transition-all"
          />
        </div>
        <select className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-softcon-secondary">
          <option value="">Todos los Estados</option>
          <option value="planeacion">En Planeación</option>
          <option value="ejecucion">En Ejecución</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      {/* Ejemplo de formulario visualmente ordenado */}
      <FormularioEjemplo />
      {/* Listado de Proyectos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-softcon-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Cargando portafolio de obras...</p>
        </div>
      ) : proyectos.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {proyectos.map((proyecto) => (
            <div key={proyecto.id} className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 hover:border-softcon-secondary/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#8b5cf6]/20 p-3 rounded-2xl text-[#8b5cf6] group-hover:bg-[#8b5cf6] group-hover:text-white transition-colors">
                  <HardHat size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  proyecto.estado === 'ejecucion' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {proyecto.estado}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{proyecto.nombre}</h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">{proyecto.descripcion}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar size={16} className="text-softcon-primary" />
                  <span className="text-xs">{proyecto.fecha_inicio}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 justify-end">
                  <DollarSign size={16} className="text-softcon-primary" />
                  <span className="text-xs font-bold">GTQ {proyecto.presupuesto?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
          <p className="text-slate-500 text-lg">No hay proyectos registrados actualmente.</p>
          <button className="mt-4 text-softcon-primary font-bold hover:underline">Comenzar primera obra</button>
        </div>
      )}
    </div>
  );
}