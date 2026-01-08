import React, { useState, useEffect } from 'react';
import inventarioApi from '../api/inventarioApi';

export default function Inventarios() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    inventarioApi.getMateriales(1)
      .then(res => { if (mounted) setMateriales(res.data || []); })
      .catch(() => { if (mounted) setError('Error al cargar inventario'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      {loading ? 'Cargando...' : 'Contenido de inventarios'}
      {error && <div>{error}</div>}
      {!loading && materiales.map(m => <div key={m.id}>{m.nombre}</div>)}
    </div>
  );
}