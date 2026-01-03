import React, { useState } from 'react';

const CalculadoraModal = ({ alCalcular }) => {
  const [medidas, setMedidas] = useState({ largo: 0, alto: 0 });

  const procesarCalculo = () => {
    const area = Number(medidas.largo || 0) * Number(medidas.alto || 0);
    if (typeof alCalcular === 'function') {
      alCalcular(area);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border">
      <h3 className="font-bold text-lg mb-4 text-slate-800">📐 Calculadora de Cantidades</h3>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Largo (m)"
          className="p-2 border rounded"
          value={medidas.largo}
          onChange={(e) => setMedidas({ ...medidas, largo: Number(e.target.value || 0) })}
        />
        <input
          type="number"
          placeholder="Alto (m)"
          className="p-2 border rounded"
          value={medidas.alto}
          onChange={(e) => setMedidas({ ...medidas, alto: Number(e.target.value || 0) })}
        />
      </div>
      <button
        type="button"
        onClick={procesarCalculo}
        className="w-full mt-4 bg-orange-500 text-white font-bold py-2 rounded-lg"
      >
        Calcular e Inyectar a IA
      </button>
    </div>
  );
};

export default CalculadoraModal;
