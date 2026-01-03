import React, { useState } from 'react';
import api from '../api';
import { UploadCloud, CheckCircle } from 'lucide-react';

const ImportadorCSV = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      // Backend alias: POST /importar/maestro (admin-only)
      await api.post('/importar/maestro', formData);
      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error en el formato del CSV';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-orange-500 transition-all text-center">
      {!success ? (
        <>
          <UploadCloud className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-800">Importación Masiva</h3>
          <p className="text-sm text-slate-500 mb-6">Sube tu CSV para poblar proyectos e insumos.</p>
          <label className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-slate-800 inline-block">
            {loading ? 'Procesando...' : 'Seleccionar Archivo'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </>
      ) : (
        <div className="text-green-600">
          <CheckCircle className="mx-auto mb-2" size={48} />
          <p className="font-bold">¡Datos importados correctamente!</p>
        </div>
      )}
    </div>
  );
};

export default ImportadorCSV;
