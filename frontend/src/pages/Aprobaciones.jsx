
import React, { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Aprobaciones() {
  const [pendientes, setPendientes] = useState([]);
  const [status, setStatus] = useState('');

  const fetchPendientes = () => {
    api
      .get('/compras/pendientes-aprobacion')
      .then((res) => {
        setPendientes(res.data || []);
        setStatus('');
      })
      .catch((err) => setStatus(`Error: ${err?.response?.data?.detail || err?.message || 'No se pudo cargar'}`));
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const manejarDecision = (id, estado) => {
    setStatus('');
    api
      .put(`/compras/orden/${id}/estado`, { estado })
      .then(() => fetchPendientes())
      .catch((err) => setStatus(`Error: ${err?.response?.data?.detail || err?.message || 'No se pudo actualizar'}`));
  };

  return (
    <div className="px-10 py-6">
      <h2 className="text-2xl font-black mb-3 text-slate-800">Órdenes de Compra por Autorizar</h2>
      {status && (
        <p className={`mb-2 font-bold ${status.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{status}</p>
      )}
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <table className="w-full border-collapse">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3 text-left">Proyecto</th>
              <th className="p-3 text-left">Proveedor</th>
              <th className="p-3 text-right">Monto</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map((oc) => (
              <tr key={oc.id} className="border-b border-slate-200">
                <td className="p-3">{oc.nombre_proyecto || oc.proyecto_id}</td>
                <td className="p-3">{oc.proveedor || '-'}</td>
                <td className="p-3 text-right font-black text-red-500">Q{Number(oc.total || 0).toFixed(2)}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => manejarDecision(oc.id, 'aprobada')}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg font-black mr-2 hover:bg-green-700 transition"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => manejarDecision(oc.id, 'rechazada')}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg font-black hover:bg-red-700 transition"
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
            {pendientes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-slate-400">No hay órdenes pendientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
