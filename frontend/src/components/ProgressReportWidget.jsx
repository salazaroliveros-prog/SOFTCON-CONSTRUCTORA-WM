import React, { useState } from 'react';
import api from '../api/client.js';

export default function ProgressReportWidget() {
  const [renglonId, setRenglonId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const submit = async () => {
    setStatus('');

    if (!renglonId.trim()) {
      setStatus('Ingresa el UUID del renglón.');
      return;
    }
    if (!cantidad || Number.isNaN(Number(cantidad))) {
      setStatus('Ingresa una cantidad válida.');
      return;
    }

    try {
      const form = new FormData();
      form.append('renglon_id', renglonId.trim());
      form.append('cantidad', String(cantidad));
      if (file) form.append('foto', file);

      await api.post('/campo/reportar-avance', form);
      setStatus('Reporte enviado correctamente.');
    } catch (err) {
      setStatus(`Error: ${err?.response?.data?.detail || err?.message || 'No se pudo enviar'}`);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', flex: 1 }}>
      <p style={{ color: '#718096', fontSize: '12px', fontWeight: 'bold' }}>REPORTE DE AVANCE (FOTO)</p>

      <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
        <input
          value={renglonId}
          onChange={(e) => setRenglonId(e.target.value)}
          placeholder="Renglón UUID"
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <input
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Cantidad avanzada (m2, ml, etc)"
          inputMode="decimal"
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={submit}
          style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: '#3498db', color: '#fff', fontWeight: 'bold' }}
        >
          Enviar Reporte
        </button>

        {status && (
          <p style={{ marginTop: '6px', color: status.startsWith('Error') ? '#e53e3e' : '#2f855a' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
