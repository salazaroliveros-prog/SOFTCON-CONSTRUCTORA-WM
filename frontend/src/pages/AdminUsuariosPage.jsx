import React, { useEffect, useState } from 'react';
import api from '../api/index.js';

const ROLES = ['admin', 'supervisor', 'bodeguero', 'trabajador'];

export default function AdminUsuariosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/auth/admin/users/pending');
      setItems(res?.data?.items || []);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await api.post(`/auth/admin/users/${id}/approve`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Error aprobando usuario');
    }
  };

  const setRole = async (id, rol) => {
    try {
      await api.post(`/auth/admin/users/${id}/role`, { rol });
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Error asignando rol');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">Usuarios pendientes</h1>
          <p className="text-slate-400 font-medium">Aprobar y asignar rol</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-5 py-2.5 rounded-xl bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 transition"
        >
          Recargar
        </button>
      </div>

      {error ? (
        <div className="mb-4 p-3 rounded-xl bg-red-900/80 text-red-200 text-sm border border-red-400/30">
          {String(error)}
        </div>
      ) : null}

      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/10 text-sm text-slate-400">
          {loading ? 'Cargando…' : `${items.length} usuario(s) pendiente(s)`}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800 text-yellow-300">
              <tr>
                <th className="text-left font-bold p-3">Usuario</th>
                <th className="text-left font-bold p-3">Email</th>
                <th className="text-left font-bold p-3">Creado</th>
                <th className="text-left font-bold p-3">Rol</th>
                <th className="text-right font-bold p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">{u.username}</td>
                  <td className="p-3 text-slate-300">{u.email}</td>
                  <td className="p-3 text-slate-400">{u.creado_en ? new Date(u.creado_en).toLocaleString() : '—'}</td>
                  <td className="p-3">
                    <select
                      className="border border-white/10 rounded-xl px-2 py-1 bg-slate-900 text-yellow-200 font-semibold"
                      defaultValue={u.rol || 'trabajador'}
                      onChange={(e) => setRole(u.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => approve(u.id)}
                      className="px-4 py-1.5 rounded-xl bg-green-500 text-white font-bold hover:bg-green-400 transition"
                    >
                      Aprobar
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 ? (
                <tr>
                  <td className="p-6 text-slate-500" colSpan={5}>
                    No hay usuarios pendientes.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
