import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/services.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({ username, password });
      const token = res?.data?.access_token;
      if (!token) throw new Error('Token no recibido');
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Error de login';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Iniciar sesión</h1>
        <p className="text-sm text-slate-500 mt-1">SOFTCON-MYS-CONSTRU-WM</p>

        {error ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Usuario</label>
            <input
              className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-xl py-2 font-bold hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-slate-600 mt-4">
          ¿No tienes cuenta?{' '}
          <Link className="font-bold text-slate-900 hover:underline" to="/register">
            Solicitar acceso
          </Link>
        </p>
      </div>
    </div>
  );
}
