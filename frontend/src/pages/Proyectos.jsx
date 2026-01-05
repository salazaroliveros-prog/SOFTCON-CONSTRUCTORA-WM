import React, { useEffect, useState } from 'react';
  const [user, setUser] = useState(null);

  // Obtener usuario autenticado al cargar
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    alert('Sesión cerrada');
    // Opcional: recargar proyectos públicos
    fetchProyectos();
  };
import { supabase } from '../supabaseClient';

// Obtener usuario autenticado
async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}
import { Briefcase, Plus, Loader2, AlertCircle } from 'lucide-react';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener datos reales de Supabase
  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .order('creado_at', { ascending: false });

      if (error) throw error;
      setProyectos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ejemplo: función para crear un proyecto con user_id
  const crearProyecto = async (nuevoProyecto) => {
    const user = await getCurrentUser();
    if (!user) {
      alert('Debes iniciar sesión para crear un proyecto');
      return;
    }
    const { error } = await supabase.from('proyectos').insert([
      { ...nuevoProyecto, user_id: user.id }
    ]);
    if (error) alert('Error al crear proyecto: ' + error.message);
    else fetchProyectos();
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
  };

  // Estado para el formulario de nuevo proyecto
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre_proyecto: '',
    cliente: '',
    presupuesto_total: '',
    fecha_inicio: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    setNuevoProyecto({ ...nuevoProyecto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearProyecto({
      ...nuevoProyecto,
      presupuesto_total: parseFloat(nuevoProyecto.presupuesto_total)
    });
    setNuevoProyecto({ nombre_proyecto: '', cliente: '', presupuesto_total: '', fecha_inicio: '' });
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Gestión de Proyectos
          </h1>
          <p className="text-slate-500 font-medium italic">"CONSTRUYENDO TU FUTURO"</p>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus size={20} /> Nuevo Proyecto
          </button>
          {user && (
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Nombre del Proyecto</label>
            <input name="nombre_proyecto" value={nuevoProyecto.nombre_proyecto} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Cliente</label>
            <input name="cliente" value={nuevoProyecto.cliente} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Presupuesto Total</label>
            <input name="presupuesto_total" type="number" value={nuevoProyecto.presupuesto_total} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Fecha de Inicio</label>
            <input name="fecha_inicio" type="date" value={nuevoProyecto.fecha_inicio} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="col-span-full flex gap-2 mt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Crear</button>
            <button type="button" className="bg-gray-200 px-4 py-2 rounded font-bold" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Cargando datos de SOFTCON...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={24} />
          <p>Error al conectar con la base de datos: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((proy) => (
            <div 
              key={proy.id} 
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* Indicador de Estado */}
              <div className="absolute top-0 right-0 p-3">
                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-lg ${
                  proy.estado === 'En ejecución' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {proy.estado}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-100 rounded-xl text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{proy.nombre_proyecto}</h3>
                  <p className="text-sm text-slate-500">{proy.cliente || 'Sin cliente asignado'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Presupuesto</span>
                  <span className="font-black text-slate-800">{formatCurrency(proy.presupuesto_total || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Inicio</span>
                  <span className="text-sm font-medium text-slate-600">
                    {proy.fecha_inicio ? new Date(proy.fecha_inicio).toLocaleDateString() : 'Pendiente'}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                Ver Detalles
              </button>
            </div>
          ))}

          {proyectos.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-medium">No hay proyectos registrados en Supabase.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import React from 'react';

export default function Proyectos() {
  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">Proyectos</h1>
      <p className="mt-2 text-sm text-slate-600">
        Aquí irá el módulo de proyectos (crear/listar/seleccionar proyecto activo).
      </p>
    </div>
  );
}
