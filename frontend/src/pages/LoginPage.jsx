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
    <div className={`login-page-container ${themeClass}`} id="mainBody">
      <div className={`card-container${isFlipped ? " is-flipped" : ""}`}> 
        <div className="card-inner">
          {/* Watermark y logo */}
          <div className="watermark-text">M&S</div>
          {/* <div className="logo-watermark"></div> */}
          {/* VISTA LOGIN */}
          <div className="card-face face-login glass-panel">
            <div className="flex flex-col h-full relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-gradient mb-2 leading-tight">INGRESA</h2>
                <div className="h-1.5 w-20 bg-[var(--primary-color)] mx-auto rounded-full shadow-lg"></div>
              </div>
              <form onSubmit={handleLogin} className="form-layout">
                <div className="input-group">
                  <label>Correo Electrónico</label>
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" className="btn-custom" disabled={loading}>
                  {loading ? "Entrando..." : "Iniciar Sesión"}
                </button>
              </form>
              <div className="mt-auto pt-6 text-center border-t border-white/20">
                <p className="text-white text-sm">
                  ¿No tienes cuenta? 
                  <button onClick={() => { setIsFlipped(true); setTheme("register"); }} className="text-[var(--primary-color)] font-black hover:underline ml-1 uppercase text-xs">Regístrate</button>
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
              <form onSubmit={handleRegister} className="form-layout space-y-4">
                <div className="input-group">
                  <label>Nombre Completo</label>
                  <input type="text" value={nombre} onChange={(e)=>setNombre(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Correo</label>
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-custom w-full mt-4" disabled={loading}>
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
            <div className="card-face face-final glass-panel" style={{zIndex: 10, pointerEvents: 'auto'}}>
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
