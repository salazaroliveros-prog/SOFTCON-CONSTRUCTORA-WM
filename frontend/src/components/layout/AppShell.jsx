import React from 'react';
import Sidebar from '../Sidebar';

export default function AppShell({ children, user }) {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar user={user} />

      {/* Área de contenido con scroll independiente */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-900">
        {children}
      </main>
    </div>
  );
}