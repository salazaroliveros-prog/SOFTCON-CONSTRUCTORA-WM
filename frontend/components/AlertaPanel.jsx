import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api';

const AlertaPanel = ({ proyectoId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/proyectos/${proyectoId}/alertas`).then(res => setData(res.data));
  }, [proyectoId]);

  if (!data) return null;

  return (
    <div className={`p-4 rounded-xl border-2 mb-6 flex items-center justify-between ${
      data.alerta_critica ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      <div className="flex items-center space-x-3">
        {data.alerta_critica ? <AlertTriangle className="animate-bounce" /> : <CheckCircle />}
        <div>
          <p className="font-bold">
            {data.alerta_critica ? '¡ALERTA DE SOBRECOSTO!' : 'Rentabilidad Bajo Control'}
          </p>
          <p className="text-sm opacity-80">
            Has consumido el {data.porcentaje_consumido}% del presupuesto IA.
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase font-bold opacity-50">Gasto Real</p>
        <p className="text-xl font-black">Q {data.gasto_real.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AlertaPanel;