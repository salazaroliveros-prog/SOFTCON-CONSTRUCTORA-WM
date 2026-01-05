import React, { useEffect } from 'react';
import AuthCard from './components/AuthCard';
import './index.css'; // Asegúrate de que los estilos globales se importen aquí

const App: React.FC = () => {
  // useEffect para asegurar que el tema inicial se aplique en el body
  useEffect(() => {
    document.body.classList.add('softcon-theme'); // O cualquier clase base para tus temas
  }, []);

  return (
    <div className="bg-[#0a0a0a] flex justify-center items-center min-h-screen p-6 overflow-hidden relative">
      <AuthCard />
    </div>
  );
};

export default App;