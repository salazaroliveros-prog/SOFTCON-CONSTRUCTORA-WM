import React, { useEffect, useState } from 'react';
import api from '../api';

const GaleriaObra = ({ proyectoId }) => {
  const [fotos, setFotos] = useState([]);

  const cargar = () => {
    if (!proyectoId) return;
    api
      .get(`/proyectos/${proyectoId}/fotos`)
      .then((res) => setFotos(res.data || []))
      .catch(() => setFotos([]));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  const subir = async (file) => {
    if (!file || !proyectoId) return;
    const form = new FormData();
    form.append('foto', file);

    await api.post(`/proyectos/${proyectoId}/fotos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    cargar();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-lg font-bold mb-4 text-slate-700 flex items-center">🖼️ Evidencia Fotográfica Reciente</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fotos.map((foto) => (
          <div key={foto.id} className="group relative overflow-hidden rounded-xl bg-slate-100 aspect-square">
            <img
              src={foto.url_foto}
              alt="Avance"
              className="object-cover w-full h-full transition transform group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition">
              {foto.fecha_registro ? new Date(foto.fecha_registro).toLocaleDateString() : ''}
            </div>
          </div>
        ))}

        <label className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition aspect-square">
          <span className="text-2xl text-slate-400">+</span>
          <span className="text-xs text-slate-400 font-medium">Subir Foto</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              subir(file);
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default GaleriaObra;
