import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, HardHat, Package, Wallet, Settings, ShieldCheck, LogOut } from 'lucide-react';

const logoModules = import.meta.glob('../assets/LOGO_CONSTRUCTORA_icono.jpg', {
  eager: true,
  import: 'default',
});
const logoMS = Object.values(logoModules)[0];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  let rol = '';
  try {
    const payload = token ? JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) : null;
    rol = payload?.rol || '';
  } catch {
    rol = '';
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Proyectos', path: '/proyectos', icon: <HardHat size={20} /> },
    { name: 'Inventarios', path: '/inventarios', icon: <Package size={20} /> },
    { name: 'Gastos Personales', path: '/finanzas-personales', icon: <Wallet size={20} /> },
  ];

  if (rol === 'admin') {
    menuItems.push({ name: 'Usuarios', path: '/admin/usuarios', icon: <ShieldCheck size={20} /> });
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4">
      <div className="mb-8 px-4 py-2">
        {logoMS ? (
          <img src={logoMS} alt="SOFTCON-MYS" className="w-32 h-auto rounded-lg shadow-md" />
        ) : (
          <h1 className="text-2xl font-black tracking-tighter text-blue-400 leading-tight">
            SOFTCON-MYS<br />
            <span className="text-blue-200">CONSTRU-WM</span>
          </h1>
        )}
        <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">
          CONSTRUYENDO TU FUTURO
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center space-x-2 text-slate-400 hover:text-white hover:bg-slate-800 p-3 rounded-lg"
        >
          <LogOut size={18} />
          <span className="text-sm">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
