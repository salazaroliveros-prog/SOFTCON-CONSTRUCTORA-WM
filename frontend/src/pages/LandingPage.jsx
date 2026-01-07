
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoWM from '../assets/REDISEÑO_ICONO.jpg';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <nav className="p-6 flex justify-between items-center bg-white shadow-sm">
        {logoWM ? (
          <img src={logoWM} alt="Logo" className="h-12" />
        ) : (
          <div className="font-black text-slate-900">SOFTCON</div>
        )}
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold"
          onClick={() => navigate('/login')}
        >
          Probar Demo
        </button>
      </nav>

      <div className="max-w-6xl mx-auto py-20 px-6 text-center">
        <h1 className="text-6xl font-black text-slate-900 mb-6">
          Deja de perder dinero en tus obras.
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          La única herramienta para constructores guatemaltecos que integra Inteligencia Artificial y
          control financiero personal.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <FeatureCard title="IA en Quetzales" desc="Presupuestos precisos por departamento." />
          <FeatureCard title="Caja del Dueño" desc="Separa tus utilidades de tus gastos de casa." />
          <FeatureCard title="Control de Bodega" desc="Cero fugas de material con reportes de campo." />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:scale-105 transition">
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-500">{desc}</p>
  </div>
);

export default LandingPage;
