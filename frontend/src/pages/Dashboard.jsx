import React, { useEffect, useState } from 'react';
import { Briefcase, User, Wallet, HardHat } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api';
import AlertaPanel from '../components/AlertaPanel.jsx';
import GaleriaObra from '../components/GaleriaObra.jsx';
import ImportadorCSV from '../components/ImportadorCSV.jsx';

const StatCard = ({ title, value, color }) => (
  <div
    style={{
      background: '#fff',
      padding: '16px',
      borderRadius: '12px',
      borderLeft: '4px solid #3182ce',
      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    }}
  >
    <p style={{ fontSize: '12px', color: '#718096', fontWeight: 800, textTransform: 'uppercase' }}>
      {title}
    </p>
    <p style={{ fontSize: '24px', fontWeight: 900, color }}>{value}</p>
  </div>
);

const DashboardFinal = ({ proyectoId }) => {
  const [proyectoActivoDesdeApi, setProyectoActivoDesdeApi] = useState('');
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [totalGastosPersonales, setTotalGastosPersonales] = useState(null);
  const [resumenPersonalError, setResumenPersonalError] = useState('');

  useEffect(() => {
    if (proyectoId) return;

    api
      .get('/proyectos')
      .then((res) => {
        const first = Array.isArray(res.data) ? res.data[0] : null;
        if (!first) return;

        setProyectoActivoDesdeApi(first.id);
        setNombreProyecto(first.nombre_proyecto || first.nombre || '');
      })
      .catch(() => {
        // Silencioso: sin proyecto no se muestran alertas/galería
      });
  }, [proyectoId]);

  useEffect(() => {
    api
      .get('/finanzas-personales/resumen')
      .then((res) => {
        const total = Number(res?.data?.total_gastos ?? 0);
        setTotalGastosPersonales(Number.isFinite(total) ? total : 0);
        setResumenPersonalError('');
      })
      .catch((err) => {
        // Si no hay token / no está logueado, no rompemos el tablero.
        setTotalGastosPersonales(null);
        setResumenPersonalError(err?.response?.data?.detail || '');
      });
  }, []);

  const PROYECTO_ACTIVO = proyectoId || proyectoActivoDesdeApi;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            SOFTCON-MYS-CONSTRU-WM
          </h1>
          <p className="text-slate-500 font-medium italic">"Construyendo tu futuro"</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <div className="bg-white border px-4 py-2 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Versión</p>
            <p className="text-xs font-black">PRO-BUILD v1.0</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AlertaPanel proyectoId={PROYECTO_ACTIVO} />

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-black mb-6 flex items-center">
              <HardHat className="mr-2 text-orange-500" /> Estado de Obra: {nombreProyecto || 'Edificio Horizonte'}
            </h2>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 font-bold uppercase">Avance Físico</p>
                <p className="text-3xl font-black text-slate-800">68%</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 font-bold uppercase">Materiales en Bodega</p>
                <p className="text-3xl font-black text-slate-800">Q 45,200</p>
              </div>
            </div>
            <GaleriaObra proyectoId={PROYECTO_ACTIVO} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Gastos Personales (acumulado)</p>
              <h2 className="text-4xl font-black mt-2">
                {totalGastosPersonales === null ? '—' : `Q ${totalGastosPersonales.toFixed(2)}`}
              </h2>
              <div className="mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <p className="text-xs opacity-70">Estado</p>
                <p className="text-sm font-bold text-white/80">
                  {resumenPersonalError ? 'Inicia sesión para ver tu resumen' : 'Actualizado desde tu cuenta'}
                </p>
              </div>
            </div>
            <Wallet className="absolute -bottom-4 -right-4 text-white/5" size={150} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition font-bold text-sm">
                <Briefcase className="mr-3 text-blue-600" size={18} /> Nueva Orden de Compra
              </button>
              <button className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-green-50 transition font-bold text-sm">
                <User className="mr-3 text-green-600" size={18} /> Registrar Gasto Personal
              </button>
            </div>
          </div>

          <ImportadorCSV />
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ proyectoId } = {}) => {
  const [metricas, setMetricas] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!proyectoId) return;

    api
      .get(`/finanzas/estado-resultado/${proyectoId}`)
      .then((res) => {
        setMetricas(res.data);
        setError('');
      })
      .catch((err) => {
        setMetricas(null);
        setError(err?.response?.data?.detail || err?.message || 'Error consultando finanzas');
      });
  }, [proyectoId]);

  if (!proyectoId) {
    return <DashboardFinal proyectoId={proyectoId} />;
  }

  if (error) return <p style={{ color: '#e53e3e' }}>Error: {error}</p>;
  if (!metricas) return <p>Cargando datos financieros...</p>;

  const data = [
    {
      nombre_proyecto: metricas.nombre_proyecto || 'Proyecto',
      ingresos: metricas.ingresos,
      egresos_totales: metricas.egresos_totales,
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f7fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '18px', color: '#2d3748' }}>
        Control Maestro: {metricas.nombre_proyecto || metricas.proyecto_id}
      </h1>

      <AlertaPanel proyectoId={proyectoId} />

      <GaleriaObra proyectoId={proyectoId} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <StatCard title="Ingresos Totales" value={`Q${metricas.ingresos}`} color="#2f855a" />
        <StatCard title="Gastos Materiales" value={`Q${metricas.egresos_materiales}`} color="#e53e3e" />
        <StatCard title="Planilla Pagada" value={`Q${metricas.egresos_planilla}`} color="#dd6b20" />
        <StatCard title="Utilidad Neta" value={`Q${metricas.utilidad_neta}`} color="#3182ce" />
      </div>

      <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>Análisis de Costos vs. Ingresos</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre_proyecto" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#2ecc71" name="Ingresos" />
              <Bar dataKey="egresos_totales" fill="#e74c3c" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;