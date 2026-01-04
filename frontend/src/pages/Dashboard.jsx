import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, User, Wallet, HardHat } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api";
import AlertaPanel from "../components/AlertaPanel.jsx";
import GaleriaObra from "../components/GaleriaObra.jsx";
import ImportadorCSV from "../components/ImportadorCSV.jsx";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const money = (value) => {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(safe);
};

const StatCard = ({ title, value, tone = "sky" }) => {
  const toneMap = {
    sky: "border-sky-400/40 text-sky-200",
    green: "border-emerald-400/40 text-emerald-200",
    red: "border-rose-400/40 text-rose-200",
    amber: "border-amber-400/40 text-amber-200",
  };

  return (
    <Card className={`border-l-4 ${toneMap[tone] || toneMap.sky}`}>
      <CardBody className="py-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
        <p className="mt-2 text-2xl font-black text-slate-100">{value}</p>
      </CardBody>
    </Card>
  );
};

const DashboardFinal = ({ proyectoId }) => {
  const [proyectoActivoDesdeApi, setProyectoActivoDesdeApi] = useState("");
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [totalGastosPersonales, setTotalGastosPersonales] = useState(null);
  const [resumenPersonalError, setResumenPersonalError] = useState("");

  useEffect(() => {
    if (proyectoId) return;

    api
      .get("/proyectos")
      .then((res) => {
        const first = Array.isArray(res.data) ? res.data[0] : null;
        if (!first) return;

        setProyectoActivoDesdeApi(first.id);
        setNombreProyecto(first.nombre_proyecto || first.nombre || "");
      })
      .catch(() => {
        // silencioso
      });
  }, [proyectoId]);

  useEffect(() => {
    api
      .get("/finanzas-personales/resumen")
      .then((res) => {
        const total = Number(res?.data?.total_gastos ?? 0);
        setTotalGastosPersonales(Number.isFinite(total) ? total : 0);
        setResumenPersonalError("");
      })
      .catch((err) => {
        setTotalGastosPersonales(null);
        setResumenPersonalError(err?.response?.data?.detail || "");
      });
  }, []);

  const PROYECTO_ACTIVO = proyectoId || proyectoActivoDesdeApi;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            SOFTCON-MYS-CONSTRU-WM · “Construyendo tu futuro”
          </p>
        </div>

        <Card className="w-fit">
          <CardBody className="py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Versión
            </p>
            <p className="text-xs font-black text-slate-100">PRO-BUILD v1.0</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AlertaPanel proyectoId={PROYECTO_ACTIVO} />

          <Card>
            <CardBody>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <HardHat className="text-amber-300" />
                Estado de Obra:{" "}
                <span className="text-slate-200 font-black">
                  {nombreProyecto || "Edificio Horizonte"}
                </span>
              </h2>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                    Avance Físico
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-100">68%</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                    Materiales en Bodega
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-100">Q 45,200</p>
                </div>
              </div>

              <div className="mt-6">
                <GaleriaObra proyectoId={PROYECTO_ACTIVO} />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="relative overflow-hidden">
            <CardBody>
              <p className="text-[11px] font-bold uppercase tracking-widest text-sky-300">
                Gastos Personales (acumulado)
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-100">
                {totalGastosPersonales === null ? "—" : money(totalGastosPersonales)}
              </h2>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Estado</p>
                <p className="mt-1 text-sm font-bold text-slate-200">
                  {resumenPersonalError ? "Inicia sesión para ver tu resumen" : "Actualizado desde tu cuenta"}
                </p>
              </div>
            </CardBody>

            <Wallet className="absolute -bottom-6 -right-6 text-white/5" size={160} />
          </Card>

          <Card>
            <CardBody>
              <h3 className="font-black text-slate-100 mb-4">Acciones rápidas</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button type="button" variant="ghost" className="justify-start gap-3">
                  <Briefcase className="text-sky-300" size={18} />
                  Nueva Orden de Compra
                </Button>

                <Button type="button" variant="ghost" className="justify-start gap-3">
                  <User className="text-emerald-300" size={18} />
                  Registrar Gasto Personal
                </Button>
              </div>
            </CardBody>
          </Card>

          <ImportadorCSV />
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ proyectoId } = {}) => {
  const [metricas, setMetricas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!proyectoId) return;

    api
      .get(`/finanzas/estado-resultado/${proyectoId}`)
      .then((res) => {
        setMetricas(res.data);
        setError("");
      })
      .catch((err) => {
        setMetricas(null);
        setError(err?.response?.data?.detail || err?.message || "Error consultando finanzas");
      });
  }, [proyectoId]);

  const data = useMemo(() => {
    if (!metricas) return [];
    return [
      {
        nombre_proyecto: metricas.nombre_proyecto || "Proyecto",
        ingresos: Number(metricas.ingresos ?? 0),
        egresos_totales: Number(metricas.egresos_totales ?? 0),
      },
    ];
  }, [metricas]);

  if (!proyectoId) return <DashboardFinal proyectoId={proyectoId} />;

  if (error) {
    return (
      <Card className="border border-rose-400/20">
        <CardBody>
          <p className="text-rose-200 font-semibold">Error: {error}</p>
        </CardBody>
      </Card>
    );
  }

  if (!metricas) {
    return (
      <Card>
        <CardBody>
          <p className="text-slate-300">Cargando datos financieros...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
          Control Maestro:{" "}
          <span className="text-slate-200">
            {metricas.nombre_proyecto || metricas.proyecto_id}
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">Resumen financiero y alertas del proyecto</p>
      </div>

      <AlertaPanel proyectoId={proyectoId} />
      <GaleriaObra proyectoId={proyectoId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Ingresos Totales" value={money(metricas.ingresos)} tone="green" />
        <StatCard title="Gastos Materiales" value={money(metricas.egresos_materiales)} tone="red" />
        <StatCard title="Planilla Pagada" value={money(metricas.egresos_planilla)} tone="amber" />
        <StatCard title="Utilidad Neta" value={money(metricas.utilidad_neta)} tone="sky" />
      </div>

      <Card>
        <CardBody>
          <h2 className="text-lg font-black text-slate-100 mb-4">Análisis de Costos vs. Ingresos</h2>

          <div className="h-[320px] w-full">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="nombre_proyecto" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2,6,23,0.92)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#e2e8f0",
                  }}
                />
                <Legend />
                <Bar dataKey="ingresos" fill="#34d399" name="Ingresos" radius={[8, 8, 0, 0]} />
                <Bar dataKey="egresos_totales" fill="#fb7185" name="Egresos" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;