import React from 'react';

export default function BitacoraMapa({ reportes }) {
  const items = Array.isArray(reportes) ? reportes : [];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        marginTop: '20px',
        padding: '0 40px',
      }}
    >
      {/* Lista de Fotos */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontWeight: 900, marginBottom: '12px', color: '#2d3748' }}>Últimas Evidencias de Campo</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {items.map((rep) => (
            <img
              key={rep.id}
              src={rep.url_foto}
              alt="Evidencia"
              style={{
                borderRadius: '10px',
                height: '110px',
                width: '100%',
                objectFit: 'cover',
                border: '1px solid #e2e8f0',
              }}
            />
          ))}

          {items.length === 0 && (
            <div style={{ gridColumn: '1 / -1', color: '#718096' }}>No hay evidencias todavía.</div>
          )}
        </div>
      </div>

      {/* Mapa de Ubicación (Concepto) */}
      <div
        style={{
          background: '#fff',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          border: '2px dashed #cbd5e0',
          minHeight: '230px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#718096', textAlign: 'center', lineHeight: 1.5 }}>
          [Integración Google Maps API]
          <br />
          Puntos de GPS marcados en tiempo real según reportes de asistencia.
        </p>
      </div>
    </div>
  );
}
