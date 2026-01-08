import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Plus, Search, HardHat, Calendar, DollarSign } from 'lucide-react';
import api from '../api';
import { proyectosApi } from '../api/services';
import APUResultCard from '../components/APUResultCard';




export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  // Estado para resultados IA por proyecto
  const [apuResults, setApuResults] = useState({});

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

  // Ejemplo: función para generar APUs con IA para un proyecto
  const handleGenerarAPUsIA = async (proyectoId) => {
    const payload = {
      cantidad_base: 100, // Ajustar según necesidad
      departamento: 'Guatemala', // Ajustar según necesidad
      // ...otros campos requeridos por el backend
    };
    setApuResults((prev) => ({ ...prev, [proyectoId]: { loading: true, data: null, error: null } }));
    try {
      const response = await proyectosApi.generarAPUsIA(proyectoId, payload);
      setApuResults((prev) => ({ ...prev, [proyectoId]: { loading: false, data: response.data, error: null } }));
    } catch (error) {
      setApuResults((prev) => ({ ...prev, [proyectoId]: { loading: false, data: null, error: error?.response?.data?.detail || error.message } }));
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">
            GESTIÓN DE <span className="text-yellow-300">PROYECTOS</span>
          </h1>
          <p className="text-slate-400 font-medium">CONSTRUYENDO TU FUTURO</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-yellow-400 text-slate-900 font-bold' : 'text-slate-400 hover:text-yellow-300'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-yellow-400 text-slate-900 font-bold' : 'text-slate-400 hover:text-yellow-300'}`}
            >
              <List size={20} />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-yellow-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition shadow-lg">
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
            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-yellow-400 outline-none"
          />
        </div>
        <select className="bg-slate-900/60 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-yellow-400">
          <option value="">Todos los Estados</option>
          <option value="planeacion">En Planeación</option>
          <option value="ejecucion">En Ejecución</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      {/* Listado de Proyectos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Cargando portafolio de obras...</p>
        </div>
      ) : proyectos.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {proyectos.map((proyecto) => (
            <div key={proyecto.id} className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 group shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-yellow-400/20 p-3 rounded-2xl text-yellow-400">
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
                  <Calendar size={16} className="text-yellow-400" />
                  <span className="text-xs">{proyecto.fecha_inicio}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 justify-end">
                  <DollarSign size={16} className="text-yellow-400" />
                  <span className="text-xs font-bold">GTQ {proyecto.presupuesto?.toLocaleString()}</span>
                </div>
              </div>
              {/* Botón para generar APUs IA y resultado */}
              <div className="pt-4 flex flex-col gap-2">
                <button
                  className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition self-end"
                  onClick={() => handleGenerarAPUsIA(proyecto.id)}
                  disabled={apuResults[proyecto.id]?.loading}
                >
                  {apuResults[proyecto.id]?.loading ? 'Generando...' : 'Generar APUs IA'}
                </button>
                {apuResults[proyecto.id]?.data && (
                  <APUResultCard resultado={apuResults[proyecto.id].data} logoUrl={"/REDISENO_ICONO.jpg"} />
                )}
                {apuResults[proyecto.id]?.error && (
                  <div className="bg-red-900/80 rounded-lg p-3 mt-2 text-xs text-red-300">
                    <strong>Error:</strong> {apuResults[proyecto.id].error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
          <p className="text-slate-500 text-lg">No hay proyectos registrados actualmente.</p>
          <button className="mt-4 text-yellow-400 font-bold hover:underline">Comenzar primera obra</button>
        </div>
      )}
    </div>
  );
}