import React, { useState } from 'react';
import api from '../api';

const FormularioGastoPersonal = () => {
  const [formData, setFormData] = useState({ descripcion: '', monto: '', categoria: 'Hogar' });

  const guardarGasto = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finanzas-personales/gasto', formData);
      alert("Gasto personal registrado. Tu balance se ha actualizado.");
      setFormData({ descripcion: '', monto: '', categoria: 'Hogar' });
    } catch {
      alert("Error al guardar");
    }
  };

  return (
    <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Nuevo Gasto del Hogar</h3>
      <form onSubmit={guardarGasto} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700">Descripción</label>
          <input 
            type="text" 
            className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej. Supermercado La Torre"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Monto (Q)</label>
            <input 
              type="number" 
              className="w-full p-3 border rounded-lg mt-1"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">Categoría</label>
            <select 
              className="w-full p-3 border rounded-lg mt-1 bg-gray-50"
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            >
              <option>Hogar</option>
              <option>Salud</option>
              <option>Educación</option>
              <option>Diversión</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition">
          Guardar en Mi Caja
        </button>
      </form>
    </div>
  );
};

export default FormularioGastoPersonal;