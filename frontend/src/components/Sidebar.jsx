import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HardHat,
  Package,
  Wallet,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";

function isActivePath(currentPath, itemPath) {
  if (itemPath === "/") return currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
}

const Sidebar = ({ open = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
  let rol = "";
  try {
    const payload = token
      ? JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
      : null;
    rol = payload?.rol || "";
  } catch {
    rol = "";
  }

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Proyectos", path: "/proyectos", icon: <HardHat size={20} /> },
    { name: "Inventarios", path: "/inventarios", icon: <Package size={20} /> },
    { name: "Gastos Personales", path: "/finanzas-personales", icon: <Wallet size={20} /> },
  ];

  if (rol === "admin") {
    menuItems.push({ name: "Usuarios", path: "/admin/usuarios", icon: <ShieldCheck size={20} /> });
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    onClose();
    navigate("/login");
  };

  // Cierra el drawer al navegar (móvil)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-8 px-4 pt-6 pb-2 flex flex-col items-center">
        <img src="/REDISENO_ICONO.jpg" alt="SOFTCON-MYS" className="w-28 h-auto rounded-xl shadow-lg mb-2" />
        <p className="text-[11px] font-bold text-slate-400 mt-1 tracking-widest uppercase">
          CONSTRUYENDO TU FUTURO
        </p>
      </div>

      <nav className="space-y-2 px-2">
        {menuItems.map((item) => {
          const active = isActivePath(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={[
                "flex items-center gap-3 p-3 rounded-lg transition-colors font-semibold text-base",
                active ? "bg-yellow-400/20 text-yellow-200 border border-yellow-300/20 shadow" : "hover:bg-white/5 text-slate-300",
              ].join(" ")}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pb-6 pt-6">
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 text-slate-300 hover:text-yellow-200 hover:bg-yellow-400/10 p-3 rounded-lg font-semibold"
          >
            <LogOut size={18} />
            <span className="text-sm">Salir</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col bg-slate-900/80 backdrop-blur border-r border-white/10">
        <div className="p-4 h-full">{SidebarContent}</div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-label="Cerrar menú"
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-slate-900/95 backdrop-blur border-r border-white/10 p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-2">
              <div className="text-xs font-semibold tracking-wider text-slate-300">MENÚ</div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-slate-300 hover:bg-white/5 hover:text-white"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            {SidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default Sidebar;
