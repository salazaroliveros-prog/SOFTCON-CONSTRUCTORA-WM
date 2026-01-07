import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell.jsx";
import CounterExample from "./CounterExample.jsx";
// Asegúrate de que todas las rutas existan para evitar errores de compilación

function parseJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // Usamos una versión más segura para manejar caracteres especiales
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (error) {
    console.error("Error parseando el token de SOFTCON-WM:", error);
    return null;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Memorizamos el usuario para evitar re-cálculos innecesarios
  const user = useMemo(() => {
    return isAuthenticated ? parseJwt(localStorage.getItem("token")) : null;
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Ejemplo Zustand */}
        <Route path="/ejemplo-zustand" element={<CounterExample />} />

        {/* Rutas Privadas */}
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? (
            <AppShell user={user}>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="proyectos" element={<Proyectos />} />
                <Route path="finanzas" element={<FinanzasPersonales />} />
                <Route path="inventarios" element={<Inventarios />} />
                {user?.rol === 'admin' && <Route path="usuarios" element={<AdminUsuariosPage />} />}
                {/* Fallback interno del dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )} 
        />

        {/* Redirección global */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;