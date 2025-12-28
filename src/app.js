import React, { useState, useEffect } from 'react';

import { createClient } from '@supabase/supabase-js';
import { LayoutGrid, HardHat, Truck, FileText, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Validación de variables de entorno para Vite
const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingVars = requiredVars.filter(
  (name) => !import.meta.env[`VITE_${name}`]
);

let supabase = null;
if (missingVars.length === 0) {
  supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
  );
}

function ManualUsuario() {
  const [seccion, setSeccion] = useState('admin');

  const guias = {
    admin: [
      "1. Sube el presupuesto maestro en formato CSV para crear las metas.",
      "2. Monitorea el gráfico de 'Precisión de Stock' para detectar fugas.",
      "3. Haz clic en 'Generar PDF' para auditorías semanales."
    ],
    campo: [
      "1. Abre el checklist diario al llegar a la obra.",
      "2. Marca las tareas conforme se completen para actualizar el avance físico.",
      "3. Verifica el stock en 'Estado de Bodegas' antes de solicitar material."
    ],
    proveedor: [
      "1. Ingresa el SKU exacto del material que estás entregando.",
      "2. Indica la cantidad real y selecciona el proyecto correspondiente.",
      "3. El sistema validará el precio contra el presupuesto automáticamente."
    ]
  };

  return (
    <div className="bg-[#111] border border-[#facc15]/20 p-8 rounded-[2.5rem] mt-12 shadow-2xl shadow-yellow-500/5">
      <h2 className="text-[#facc15] font-black text-lg mb-6 flex items-center gap-2 italic">
        <Database size={18}/> CENTRO DE AYUDA WM
      </h2>
      <div className="flex gap-2 mb-6">
        {Object.keys(guias).map(role => (
          <button 
            key={role}
            onClick={() => setSeccion(role)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${seccion === role ? 'bg-[#facc15] text-black' : 'bg-white/5 text-white/40'}`}
          >
            {role === 'admin' ? 'Administrador' : role === 'campo' ? 'Campo' : 'Proveedor'}
          </button>
        ))}
      </div>
      <ul className="space-y-4">
        {guias[seccion].map((paso, i) => (
          <li key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl">
            <span className="bg-[#facc15] text-black w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center font-black text-xs">
              {i + 1}
            </span>
            <p className="text-sm text-white/80 leading-relaxed">{paso}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
function PrecisionMetric({ proyectoId }) {
  const [metricas, setMetricas] = useState({ teorico: 0, real: 0 });

  useEffect(() => {
    const calcularPrecision = async () => {
      // 1. Obtenemos lo presupuestado (Teórico)
      const { data: p } = await supabase
        .from('presupuesto_detalle')
        .select('cantidad_presupuestada')
        .eq('proyecto_id', proyectoId);

      // 2. Obtenemos lo ingresado por proveedores (Real)
      const { data: r } = await supabase
        .from('registros_compras')
        .select('cantidad_ingresada')
        .eq('proyecto_id', proyectoId);

      const totalTeorico = p?.reduce((acc, curr) => acc + curr.cantidad_presupuestada, 0) || 0;
      const totalReal = r?.reduce((acc, curr) => acc + curr.cantidad_ingresada, 0) || 0;

      setMetricas({ teorico: totalTeorico, real: totalReal });
    };

    calcularPrecision();
  }, [proyectoId]);

  const precision = metricas.teorico > 0 
    ? ((metricas.teorico / metricas.real) * 100).toFixed(1) 
    : 0;

  return (
    <div className="bg-[#111] p-6 rounded-3xl border border-white/5 mt-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Precisión de Cálculo</p>
        <span className={`text-xs font-bold ${precision > 95 ? 'text-emerald-500' : 'text-orange-500'}`}>
          {precision}% Exactitud
        </span>
      </div>
      <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#facc15]" 
          style={{ width: `${Math.min(precision, 100)}%` }}
        ></div>
      </div>
      <p className="text-[9px] text-white/20 mt-2 italic">
        * Comparativa de cantidades: Presupuesto vs Proveedores.
      </p>
    </div>
  );
}
const importarPresupuestoDetallado = async (archivoCsv) => {
  const formData = new FormData();
  formData.append('archivo', archivoCsv);

  // Enviamos a Railway para procesar la lógica pesada
  const res = await fetch(`${RAILWAY_API}/importar-presupuesto`, {
    method: 'POST',
    body: formData
  });

  if (res.ok) {
    // Una vez procesado, el Cerebro WM crea automáticamente el Checklist
    alert("Presupuesto Desglosado: Actividades creadas para el personal de campo.");
    fetchProyectos(); // Recarga el dashboard
  }
};

const generarPDF = () => {
  const doc = new jsPDF();
  doc.text("¡Hola, este es un PDF generado con jsPDF!", 10, 10);
  doc.save("ejemplo.pdf");
};

const generarReportePDF = (proyectoSeleccionado) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();

  // --- ENCABEZADO ESTILO WM ---
  doc.setFillColor(250, 204, 21); // El amarillo #facc15
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("WM CONSTRUCTORA", 15, 25);
  doc.setFontSize(10);
  doc.text("REPORTE EJECUTIVO DE PROYECTO", 15, 32);
  doc.text(`FECHA: ${fecha}`, 160, 25);

  // --- DATOS GENERALES ---
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.text(`Proyecto: ${proyectoSeleccionado.nombre}`, 15, 55);

  // Tabla de Resumen Financiero
  doc.autoTable({
    startY: 65,
    head: [['Concepto', 'Monto Presupuestado', 'Gasto Real', 'Eficiencia']],
    body: [[
      'Financiero', 
      `$${proyectoSeleccionado.presupuesto_total}`, 
      `$${proyectoSeleccionado.gasto_real_acumulado}`,
      `${((proyectoSeleccionado.gasto_real_acumulado / proyectoSeleccionado.presupuesto_total) * 100).toFixed(1)}%`
    ]],
    theme: 'striped',
    headStyles: { fillStyle: [139, 92, 246] } // Violeta secundario
  });

  // --- DETALLE DE INVENTARIO Y AVANCE ---
  doc.text("Resumen de Actividades y Stock", 15, doc.lastAutoTable.finalY + 15);
  // Aquí puedes agregar más tablas automáticas con los datos de Supabase

  // --- PIE DE PÁGINA ---
  doc.setFontSize(8);
  doc.text("Este documento es generado automáticamente por el Cerebro WM v1.0", 15, 285);

  // Descargar archivo
  doc.save(`Reporte_WM_${proyectoSeleccionado.nombre}_${fecha}.pdf`);
};

function generarReporteEjecutivo(proyectos, periodo = 'semanal') {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();

  // Cargar logo y continuar con el PDF
  const logoImg = new Image();
  logoImg.src = process.env.PUBLIC_URL + '/logo.png'; // Asegúrate de tener logo.png en /public
  logoImg.onload = function() {
    // Encabezado visual corporativo con logo
    doc.setFillColor(250, 204, 21); // Amarillo WM
    doc.rect(0, 0, 210, 30, 'F');
    doc.addImage(logoImg, 'PNG', 10, 6, 18, 18); // Logo en la esquina superior izquierda
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('WM CONSTRUCTORA', 32, 18);
    doc.setFontSize(12);
    doc.text('Reporte Ejecutivo ' + (periodo === 'mensual' ? 'Mensual' : 'Semanal'), 32, 26);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('Fecha de generación: ' + fecha, 150, 18);
    doc.text('Total de proyectos: ' + proyectos.length, 150, 26);

    // Métricas generales
    const avancePromedio = proyectos.length > 0 ? (
      proyectos.reduce((acc, p) => acc + (parseFloat(p.porcentaje_avance_fisico) || 0), 0) / proyectos.length
    ).toFixed(1) : 0;
    const proyectosConAlertas = proyectos.filter(p => parseInt(p.alertas || 0) > 0).length;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Avance físico promedio: ${avancePromedio}%`, 14, 38);
    doc.text(`Proyectos con alertas: ${proyectosConAlertas}`, 90, 38);
    doc.text(`Proyectos sin alertas: ${proyectos.length - proyectosConAlertas}`, 150, 38);

    // Tabla de proyectos
    const head = [['Proyecto', 'Avance (%)', 'Alertas', 'Última actualización', 'Salud']];
    const body = proyectos.map(p => {
      const avance = parseFloat(p.porcentaje_avance_fisico) || 0;
      const alertas = parseInt(p.alertas || 0);
      let salud = 'Óptimo';
      // Aquí puedes agregar lógica para determinar el estado de salud si lo deseas
      return [
        p.nombre || '',
        avance + '%',
        alertas,
        p.ultima_actualizacion || fecha,
        salud
      ];
    });
  });

  doc.autoTable({
    head,
    body,
    startY: 45,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [250, 204, 21], textColor: 0, fontStyle: 'bold' },
    bodyStyles: { textColor: 50 },
    margin: { left: 14, right: 14 },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        // Colorea la celda de salud
        if (data.cell.raw === 'Óptimo') data.cell.styles.textColor = [34, 197, 94]; // verde
        if (data.cell.raw === 'Atención') data.cell.styles.textColor = [250, 204, 21]; // amarillo
        if (data.cell.raw === 'Riesgo') data.cell.styles.textColor = [239, 68, 68]; // rojo
        if (data.cell.raw === 'Crítico') data.cell.styles.textColor = [139, 92, 246]; // violeta
      }
    }
  });

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Este reporte es generado automáticamente por el sistema WM Control', 14, 285);

  doc.save(`reporte_ejecutivo_${periodo}_${fecha.replace(/\//g, '-')}.pdf`);
}

// --- COMPONENTE DE VISUALIZACIÓN DE STOCK ---
function StockViewer() {
  const [inventario, setInventario] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    const fetchInventario = async () => {
      const { data, error } = await supabase
        .from('inventario_materiales')
        .select('*, proyectos(nombre)'); // Traemos el nombre del proyecto también
      if (!error) setInventario(data);
      setLoadingStock(false);
    };
    fetchInventario();
    // Suscripción en tiempo real para el inventario
    const sub = supabase
      .channel('cambios-inventario')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario_materiales' }, fetchInventario)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);
  if (loadingStock) return <p className="text-[10px] animate-pulse">Sincronizando Bodegas...</p>;
  return (
    <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 mt-8">
      <h3 className="text-[11px] font-black uppercase text-[#facc15] tracking-[0.3em] mb-6 italic flex items-center gap-3">
        <Database size={16}/> Estado de Bodegas e Inventario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventario.map((item) => (
          <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{item.proyectos?.nombre}</p>
                <h4 className="text-sm font-bold">{item.nombre_material || item.codigo_sku}</h4>
              </div>
              <span className="text-[#facc15] font-black text-xs">{item.cantidad_actual} {item.unidad_medida}</span>
            </div>
            {/* Barra de nivel (Simulada para visualización) */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full transition-all duration-1000 ${item.cantidad_actual < 10 ? 'bg-red-500' : 'bg-[#facc15]'}`} 
                style={{ width: `${Math.min((item.cantidad_actual / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
        {inventario.length === 0 && (
          <p className="text-[10px] text-white/20 italic">No hay materiales registrados en el sistema aún.</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // Si faltan variables, mostramos este escudo de error
  if (missingVars.length > 0) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-10">
        <div className="bg-red-900/20 border border-red-500 p-8 rounded-3xl max-w-md w-full">
          <h2 className="text-[#facc15] font-black text-xl mb-4 uppercase tracking-tighter">⚠️ Error de Configuración</h2>
          <p className="text-sm text-white/70 mb-6">El Cerebro WM no puede arrancar porque faltan estas variables en Vercel:</p>
          <ul className="space-y-2">
            {missingVars.map(v => (
              <li key={v} className="bg-red-500/10 text-red-400 p-2 rounded-lg font-mono text-xs">{v}</li>
            ))}
          </ul>
          <p className="mt-6 text-[10px] text-white/30 uppercase italic">Agrégalas en: Vercel &gt; Settings &gt; Environment Variables</p>
        </div>
      </div>
    );
  }
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'campo', 'proveedor'
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGA DE DATOS EN TIEMPO REAL DESDE EL CEREBRO (SUPABASE)
  useEffect(() => {
    fetchProyectos();
    // Suscripción en tiempo real: Actualiza el dashboard cuando algo cambie en la DB
    const subscription = supabase
      .channel('cambios-proyectos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' }, () => {
        fetchProyectos();
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  const fetchProyectos = async () => {
    const { data, error } = await supabase.from('proyectos').select('*');
    if (!error) setProyectos(data);
    setLoading(false);
  };

  // 2. FUNCIÓN PARA IMPORTAR CSV (ENVÍA A RAILWAY)
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('archivo', file);
    const response = await fetch(`${RAILWAY_API}/importar-csv`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) alert("Presupuesto procesado por el Cerebro WM y distribuido en tablas.");
  };

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center font-black">CARGANDO CEREBRO WM...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <NotificacionesPanel />
      {/* HEADER DINÁMICO */}
      <nav className="flex justify-between items-center mb-12 bg-[#111] p-6 rounded-3xl border border-white/5">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-[#facc15]">WM CONSTRUCTORA</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Cerebro de Control Central</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setUserRole('admin')} className={`px-4 py-2 rounded-xl text-[10px] font-bold ${userRole === 'admin' ? 'bg-[#facc15] text-black' : 'bg-white/5'}`}>ADMINISTRADOR</button>
          <button onClick={() => setUserRole('campo')} className={`px-4 py-2 rounded-xl text-[10px] font-bold ${userRole === 'campo' ? 'bg-[#facc15] text-black' : 'bg-white/5'}`}>CAMPO</button>
          <button onClick={() => setUserRole('proveedor')} className={`px-4 py-2 rounded-xl text-[10px] font-bold ${userRole === 'proveedor' ? 'bg-[#facc15] text-black' : 'bg-white/5'}`}>PROVEEDOR</button>
        </div>
      </nav>

      {/* VISTA ADMINISTRADOR (DASHBOARD) */}
      {userRole === 'admin' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <KpiCard title="Flujo de Caja" value={`$${proyectos.reduce((acc, p) => acc + (p.presupuesto_total - p.gasto_real_acumulado), 0)}`} icon={<Wallet size={20}/>} />
            <KpiCard title="Alertas Sobrecosto" value="3 Activas" color="text-red-500" icon={<AlertCircle size={20}/>} />
            <div className="lg:col-span-3 bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between mb-8">
                <h3 className="font-black uppercase tracking-widest text-sm">Avance Físico vs Financiero</h3>
                <label className="cursor-pointer bg-[#facc15] text-black px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
                  <FileUp size={14}/> IMPORTAR PRESUPUESTO CSV
                  <input type="file" hidden onChange={handleCSVImport} accept=".csv" />
                </label>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={proyectos}>
                    <Area type="monotone" dataKey="porcentaje_avance_fisico" stroke="#facc15" fill="#facc15" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="gasto_real_acumulado" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Botón para descargar PDF de cada proyecto */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectos.map((proyecto) => (
              <div key={proyecto.id} className="bg-[#222] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white/40">{proyecto.nombre}</p>
                  <p className="text-[10px] text-white/20">ID: {proyecto.id}</p>
                </div>
                <button 
                  onClick={() => generarReportePDF(proyecto)}
                  className="bg-white/5 hover:bg-[#facc15] hover:text-black p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black"
                >
                  <FileUp size={14}/> DESCARGAR PDF
                </button>
              </div>
            ))}
          </div>
          <StockViewer />
        </>
      )}

      {/* VISTA CAMPO (CHECKLIST DE ACTIVIDADES) */}
      {userRole === 'campo' && (
        <div className="max-w-2xl mx-auto bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
          <h2 className="font-black text-xl mb-6 flex items-center gap-3">
            <HardHat className="text-[#facc15]" /> ACTIVIDADES DE CAMPO
          </h2>
          {/* Aquí mapearíamos la tabla 'checklist_seguimiento' de Supabase */}
          <div className="space-y-4">
            {["Cimentación", "Levantamiento de Muros", "Instalación Eléctrica"].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                <span className="font-bold text-sm">{task}</span>
                <CheckCircle2 className="text-white/20 group-hover:text-[#facc15] transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA PROVEEDOR (INGRESO DE MATERIALES) */}
      {userRole === 'proveedor' && (
        <div className="max-w-md mx-auto bg-[#111] p-8 rounded-[2.5rem] border border-[#facc15]/20 shadow-2xl shadow-yellow-500/5">
          <h2 className="font-black text-xl mb-6 text-[#facc15]">REGISTRO DE MATERIALES</h2>
          <div className="space-y-4">
            <input className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm" placeholder="Código de Producto (SKU)" />
            <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm" placeholder="Cantidad" />
            <select className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm text-white/50">
              <option>Seleccionar Proyecto...</option>
              {proyectos.map(p => <option key={p.id}>{p.nombre}</option>)}
            </select>
            <button className="w-full bg-[#facc15] text-black font-black p-4 rounded-xl uppercase tracking-widest text-xs mt-4">Enviar al Cerebro WM</button>
          </div>
        </div>
      )}

      <ManualUsuario />
      <button onClick={generarPDF} className="btn-wm mt-4">Descargar PDF de ejemplo</button>
      <button onClick={() => generarReporteEjecutivo(proyectos, 'semanal')} className="btn-wm mt-4">Descargar Reporte Ejecutivo Semanal</button>
      <button onClick={() => generarReporteEjecutivo(proyectos, 'mensual')} className="btn-wm mt-4 ml-2">Descargar Reporte Ejecutivo Mensual</button>
    </div>
  );
}

function KpiCard({ title, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
      <div className="text-white/30 mb-4">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{title}</p>
      <h4 className={`text-2xl font-black ${color}`}>{value}</h4>
    </div>
  );
}

function NotificacionesPanel() {
  const [alertas, setAlertas] = useState([]);
  useEffect(() => {
    const sub = supabase
      .channel('alertas-vivas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, payload => {
        setAlertas(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);
  return (
    <div className="fixed top-20 right-6 w-80 space-y-3 z-50">
      {alertas.map((a, i) => (
        <div key={i} className="bg-red-600 text-white p-4 rounded-2xl shadow-xl border-l-4 border-white animate-bounce">
          <p className="text-[10px] font-black uppercase">¡ALERTA DE BODEGA!</p>
          <p className="text-xs">{a.mensaje}</p>
        </div>
      ))}
    </div>
  );
}