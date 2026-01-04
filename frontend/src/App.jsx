import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Proyectos from "./pages/Proyectos.jsx";
import FinanzasPersonales from "./pages/FinanzasPersonales.jsx";
import Inventarios from "./pages/Inventarios.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminUsuariosPage from "./pages/AdminUsuariosPage.jsx";
import AppShell from "./components/layout/AppShell.jsx";

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const user = isAuthenticated ? parseJwt(localStorage.getItem("token")) : null;

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas Privadas (Protegidas) */}
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
              </Routes>
            </AppShell>
          ) : (
            <Navigate to="/login" />
          )} 
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;