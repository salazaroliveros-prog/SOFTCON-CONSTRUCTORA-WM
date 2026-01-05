import React, { useEffect, useState } from "react";
import { Briefcase, Wallet, HardHat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api";

const money = (value) => {
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value ?? 0);
};

const StatCard = ({ title, value, tone = "sky" }) => (
  <div className={`p-4 rounded-xl border bg-slate-900 bg-opacity-50 ${tone === 'sky' ? 'border-sky-400/40' : 'border-rose-400/40'}`}>
    <p className="text-sm text-slate-400">{title}</p>
    <p className="text-2xl font-black">{value}</p>
  </div>
);

export default function Dashboard() {
  const [metricas, setMetricas] = useState({ ingresos: 0, egresos_materiales: 0, utilidad_neta: 0 });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-black text-white">SOFTCON-MYS-CONSTRU-WM</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Ingresos Totales" value={money(metricas.ingresos)} />
        <StatCard title="Gastos Materiales" value={money(metricas.egresos_materiales)} tone="red" />
        <StatCard title="Utilidad Neta" value={money(metricas.utilidad_neta)} />
      </div>

      <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
        <h2 className="text-lg font-bold mb-4">Análisis de Costos vs. Ingresos</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingreso" fill="#facc15" />
              <Bar dataKey="costo" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}