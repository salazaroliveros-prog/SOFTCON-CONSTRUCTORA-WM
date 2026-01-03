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
    <div style={{ padding: '24px 40px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px', color: '#2d3748' }}>
        Órdenes de Compra por Autorizar
      </h2>

      {status && (
        <p style={{ marginBottom: '10px', color: status.startsWith('Error') ? '#e53e3e' : '#2f855a' }}>{status}</p>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#2d3748', color: '#fff' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Proyecto</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Proveedor</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Monto</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map((oc) => (
              <tr key={oc.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px' }}>{oc.nombre_proyecto || oc.proyecto_id}</td>
                <td style={{ padding: '12px' }}>{oc.proveedor || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#e53e3e' }}>
                  Q{Number(oc.total || 0).toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => manejarDecision(oc.id, 'aprobada')}
                    style={{
                      background: '#2f855a',
                      color: '#fff',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 800,
                      marginRight: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => manejarDecision(oc.id, 'rechazada')}
                    style={{
                      background: '#c53030',
                      color: '#fff',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}

            {pendientes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '14px', color: '#718096' }}>
                  No hay órdenes pendientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
