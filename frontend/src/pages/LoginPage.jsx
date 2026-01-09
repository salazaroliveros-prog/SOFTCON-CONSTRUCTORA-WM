// Consulta usuarios conectados (sesión activa en Supabase)
async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user || null;
}




import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import supabase from "../supabaseClient";


export default function LoginPage({ onLogin }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("login"); // login | register | final
  const [showFinal, setShowFinal] = useState(false);
  const navigate = useNavigate();

  // Estados Formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (loginError) throw loginError;
      // Guardar el token de sesión de Supabase en localStorage como 'token'
      const session = data.session || (await supabase.auth.getSession()).data.session;
      if (session && session.access_token) {
        localStorage.setItem("token", session.access_token);
      }
      onLogin(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Error: Credenciales inválidas o usuario no encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: regError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: nombre } }
      });
      if (regError) throw regError;
      setShowFinal(true);
      setTheme("final");
      setTimeout(() => {
        setShowFinal(false);
        setTheme("login");
        setIsFlipped(false);
        setNombre("");
        setEmail("");
        setPassword("");
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Temas visuales
  const themeClass = theme === "register" ? "theme-register" : theme === "final" ? "theme-final" : "";

  return (
    <div className={`login-page-container ${themeClass} flex items-center justify-center min-h-screen`} id="mainBody">
      <div className={`card-container${isFlipped ? " is-flipped" : ""} w-full max-w-md relative`}> 
        <div className="card-inner">
          {/* Watermark y logo */}
          <div className="watermark-text">M&S</div>
          {/* VISTA LOGIN */}
          <div className="card-face face-login glass-panel">
            <div className="flex flex-col h-full relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-gradient mb-2 leading-tight">INGRESA</h2>
                <div className="h-1.5 w-20 bg-[var(--primary-color)] mx-auto rounded-full shadow-lg"></div>
              </div>
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="rounded-lg px-3 py-2 bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="rounded-lg px-3 py-2 bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                {error && <p className="text-red-400 text-xs font-bold mt-1">{error}</p>}
                <button type="submit" className="bg-yellow-400 text-slate-900 font-black py-2 rounded-lg hover:bg-yellow-300 transition" disabled={loading}>
                  {loading ? "Entrando..." : "Iniciar Sesión"}
                </button>
              </form>
              <div className="mt-auto pt-6 text-center border-t border-white/20">
                <p className="text-white text-sm">
                  ¿No tienes cuenta? 
                  <button data-testid="go-register-btn" onClick={() => { setIsFlipped(true); setTheme("register"); }} className="text-yellow-400 font-black hover:underline ml-1 uppercase text-xs">Regístrate</button>
                </p>
              </div>
            </div>
          </div>
          {/* VISTA REGISTRO */}
          <div className="card-face face-register glass-panel">
            <div className="flex flex-col h-full relative z-10">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-black text-gradient uppercase italic">Registro Maestro</h2>
              </div>
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Nombre Completo</label>
                  <input type="text" value={nombre} onChange={(e)=>setNombre(e.target.value)} required className="rounded-lg px-3 py-2 bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Correo</label>
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="rounded-lg px-3 py-2 bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="rounded-lg px-3 py-2 bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
                <button type="submit" className="bg-violet-500 text-white font-black py-2 rounded-lg hover:bg-violet-400 transition mt-2" disabled={loading}>
                  {loading ? "Procesando..." : "Finalizar Registro"}
                </button>
              </form>
              <div className="text-center pt-3">
                <button onClick={() => { setIsFlipped(false); setTheme("login"); }} className="text-white text-xs font-bold hover:underline opacity-80">
                  ← Volver al Acceso
                </button>
              </div>
            </div>
          </div>
          {/* VISTA POST-REGISTRO (resplandor) */}
          {showFinal && (
            <div className="card-face face-final glass-panel z-10 pointer-events-auto">
              <div className="flex flex-col h-full justify-center items-center">
                <h2 className="text-3xl font-black text-gradient mb-4">¡Registro Exitoso!</h2>
                <p className="text-white text-lg mb-2">Revisa tu correo para confirmar tu cuenta.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
