import React, { useState } from 'react';
import api from '../api/client.js';

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este navegador no soporta geolocalización'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

export default function AttendanceWidget() {
  const [trabajadorId, setTrabajadorId] = useState('');
  const [status, setStatus] = useState('');
  const [coords, setCoords] = useState(null);

  const handleCheckIn = async () => {
    setStatus('');

    if (!trabajadorId.trim()) {
      setStatus('Ingresa el UUID del trabajador.');
      return;
    }

    try {
      const loc = await getCurrentPosition();
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });

      const payload = {
        trabajador_id: trabajadorId.trim(),
        latitud: loc.coords.latitude,
        longitud: loc.coords.longitude,
        fecha: new Date().toISOString(),
      };

      await api.post('/campo/asistencia', payload);
      setStatus('Asistencia registrada correctamente.');
    } catch (err) {
      setStatus(`Error: ${err?.message || 'No se pudo registrar la asistencia'}`);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', flex: 1 }}>
      <p style={{ color: '#718096', fontSize: '12px', fontWeight: 'bold' }}>ASISTENCIA (GPS)</p>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <input
          value={trabajadorId}
          onChange={(e) => setTrabajadorId(e.target.value)}
          placeholder="Trabajador UUID"
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <button
          onClick={handleCheckIn}
          style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: '#2ecc71', color: '#fff', fontWeight: 'bold' }}
        >
          Marcar
        </button>
      </div>

      {coords && (
        <p style={{ marginTop: '10px', color: '#4a5568', fontSize: '12px' }}>
          GPS: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
        </p>
      )}

      {status && (
        <p style={{ marginTop: '10px', color: status.startsWith('Error') ? '#e53e3e' : '#2f855a' }}>
          {status}
        </p>
      )}
    </div>
  );
}
