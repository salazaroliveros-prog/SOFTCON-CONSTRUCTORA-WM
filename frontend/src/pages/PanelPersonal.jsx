import React from 'react';

export default function PanelPersonal({ datosPersonales }) {
  const d = datosPersonales || {};
  const ingreso = Number(d.ingreso_disponible_empresa || 0);
  const gastos = Number(d.gastos_personales_totales || 0);
  const ahorro = Number(d.ahorro_neto_del_mes || 0);

  return (
    <div
      style={{
        marginTop: '26px',
        padding: '18px',
        background: '#2a1f6b',
        color: '#fff',
        borderRadius: '14px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
        marginLeft: '40px',
        marginRight: '40px',
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '12px' }}>
        Balance Personal (Caja del Dueño)
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
        }}
      >
        <div style={{ background: '#241a5b', padding: '14px', borderRadius: '12px' }}>
          <p style={{ fontSize: '11px', color: '#b8b3ff', fontWeight: 800, textTransform: 'uppercase' }}>
            Ingreso desde utilidades
          </p>
          <p style={{ fontSize: '26px', fontWeight: 900 }}>Q{ingreso.toFixed(2)}</p>
        </div>

        <div style={{ background: '#241a5b', padding: '14px', borderRadius: '12px' }}>
          <p style={{ fontSize: '11px', color: '#b8b3ff', fontWeight: 800, textTransform: 'uppercase' }}>
            Gastos hogar / personal
          </p>
          <p style={{ fontSize: '26px', fontWeight: 900, color: '#f56565' }}>Q{gastos.toFixed(2)}</p>
        </div>

        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px' }}>
          <p style={{ fontSize: '11px', color: '#1a202c', fontWeight: 900, textTransform: 'uppercase' }}>
            Ahorro neto real
          </p>
          <p
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: ahorro >= 0 ? '#2f855a' : '#c53030',
            }}
          >
            Q{ahorro.toFixed(2)}
          </p>
        </div>
      </div>

      {ahorro < 0 && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px',
            background: '#c53030',
            textAlign: 'center',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 900,
          }}
        >
          TUS GASTOS PERSONALES SUPERAN TUS DIVIDENDOS DE OBRA
        </div>
      )}
    </div>
  );
}
