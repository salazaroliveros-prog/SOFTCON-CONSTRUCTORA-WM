
import React, { useEffect, useState } from "react";
import { Briefcase, Wallet, HardHat } from "lucide-react";
import ChartBar from "../components/ChartBar";
import api from "../api";
import supabase from "../supabaseClient";

const money = (value) => {
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value ?? 0);
};

const StatCard = ({ title, value, tone = "sky" }) => (
  <div className={`p-4 rounded-xl border bg-slate-900/50 ${tone === 'sky' ? 'border-sky-400/40' : 'border-rose-400/40'}`}>
    <p className="text-sm text-slate-400">{title}</p>
    <p className="text-2xl font-black">{value}</p>
  </div>
);

export default function Dashboard() {
  const [metricas, setMetricas] = useState({ ingresos: 0, egresos_materiales: 0, utilidad_neta: 0 });
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  // Considera "activo" a quien tenga ultima_conexion < 5 minutos
  useEffect(() => {
    const fetchUsuariosActivos = async () => {
      // Asegúrate de que la tabla usuarios tenga un campo 'ultima_conexion' tipo timestamp
      const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, username, email, nombre, telefono, rol, ultima_conexion')
        .gte('ultima_conexion', cincoMinutosAtras);
      if (!error) setUsuariosActivos(data || []);
    };
    fetchUsuariosActivos();
    // Opcional: refrescar cada 30s
    const interval = setInterval(fetchUsuariosActivos, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid="dashboard" className="p-4 md:p-8 space-y-8 bg-slate-900 min-h-screen">
      {/* Encabezado principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">SOFTCON-MYS <span className="text-[#facc15]">CONSTRU-WM</span></h1>
          <p className="text-slate-400 font-medium">CONSTRUYENDO TU FUTURO</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ingresos Totales" value={money(metricas.ingresos)} />
        <StatCard title="Gastos Materiales" value={money(metricas.egresos_materiales)} tone="red" />
        <StatCard title="Utilidad Neta" value={money(metricas.utilidad_neta)} />
      </div>

      {/* Usuarios activos */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/10 mt-8 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span>Usuarios activos</span>
          <span className="text-xs font-normal text-slate-400">(últimos 5 min)</span>
        </h2>
        <ul className="divide-y divide-slate-700">
          {usuariosActivos.length === 0 && <li className="text-slate-400 py-2">Ningún usuario activo</li>}
          {usuariosActivos.map(u => (
            <li key={u.id} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
              <span className="font-bold text-white">{u.nombre || u.username}</span>
              <span className="text-xs text-slate-400">{u.email}</span>
              <span className="text-xs text-slate-400">{u.rol}</span>
              <span className="text-xs text-slate-500 ml-auto">{u.ultima_conexion ? new Date(u.ultima_conexion).toLocaleTimeString() : ''}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Análisis de Costos vs. Ingresos */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Análisis de Costos vs. Ingresos</h2>
        <div className="h-[300px]">
          <ChartBar
            data={[]}
            xKey="name"
            bars={[{ key: "ingreso", color: "#facc15", label: "Ingreso" }, { key: "costo", color: "#8b5cf6", label: "Costo" }]}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}