import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App' // Importación limpia

const rootElement = document.getElementById('root');

// Verificación de seguridad para el elemento raíz
if (!rootElement) {
  console.error("No se encontró el elemento con ID 'root'. Revisa tu index.html.");
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// Registro de Service Worker para PWA de SOFTCON-WM
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SOFTCON-WM PWA lista:', reg.scope))
      .catch(err => console.error('Error en PWA:', err));
  });
}