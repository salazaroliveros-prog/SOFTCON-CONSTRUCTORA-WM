import { Menu } from "lucide-react";

export default function AppShell({ title, onOpenSidebar, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-black/20">
        <div className="softcon-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
              aria-label="Abrir menú"
            >
              <Menu size={18} />
            </button>
            <div className="text-sm font-semibold tracking-wide">SOFTCON</div>
          </div>

          <div className="text-sm text-slate-300">{title || ""}</div>
        </div>
      </header>

      <main className="softcon-container py-6">{children}</main>
    </div>
  );
}