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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Usuarios pendientes</h1>
          <p className="text-sm text-slate-500">Aprobar y asignar rol</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
        >
          Recargar
        </button>
      </div>

      {error ? (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          {String(error)}
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 text-sm text-slate-600">
          {loading ? 'Cargando…' : `${items.length} usuario(s) pendiente(s)`}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
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
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold text-slate-900">{u.username}</td>
                  <td className="p-3 text-slate-700">{u.email}</td>
                  <td className="p-3 text-slate-500">{u.creado_en ? new Date(u.creado_en).toLocaleString() : '—'}</td>
                  <td className="p-3">
                    <select
                      className="border border-slate-300 rounded-xl px-2 py-1"
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
                      className="px-3 py-1.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
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
