import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Proyectos from './pages/Proyectos.jsx';
import FinanzasPersonales from './pages/FinanzasPersonales.jsx';
import Inventarios from './pages/Inventarios.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminUsuariosPage from './pages/AdminUsuariosPage.jsx';

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const payload = token ? parseJwt(token) : null;
  const rol = payload?.rol;
  if (!token) return <Navigate to="/login" replace />;
  if (rol !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/inventarios" element={<Inventarios />} />
          <Route path="/finanzas-personales" element={<FinanzasPersonales />} />
          <Route
            path="/admin/usuarios"
            element={
              <RequireAdmin>
                <AdminUsuariosPage />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;