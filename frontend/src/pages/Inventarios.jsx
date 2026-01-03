import React, { useState, useEffect } from 'react';
import api from '../api';

const Inventarios = () => {
  const [stock, setStock] = useState([]);

  useEffect(() => {
    api.get('/inventario/resumen').then(res => setStock(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">📦 Inventario en Obra</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Material</th>
              <th className="p-4 font-semibold text-slate-600">Stock Actual</th>
              <th className="p-4 font-semibold text-slate-600">Unidad</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {stock.map(item => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-medium">{item.descripcion}</td>
                <td className="p-4">{item.cantidad}</td>
                <td className="p-4 text-slate-500">{item.unidad}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.cantidad < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {item.cantidad < 10 ? 'Stock Bajo' : 'Suficiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventarios;