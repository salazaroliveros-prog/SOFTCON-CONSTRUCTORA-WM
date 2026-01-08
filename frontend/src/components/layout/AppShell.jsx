import React from 'react';
import Sidebar from '../Sidebar';

export default function AppShell({ children, user }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar user={user} />

      {/* Área de contenido responsiva y centrada */}
      <main className="flex-1 flex flex-col items-center justify-start px-2 py-6 md:p-10 bg-slate-900/95 overflow-y-auto w-full">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}