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
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Lógica de login con Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: usuario,
        password,
      });
      if (loginError) throw new Error("Credenciales inválidas. Verifica tu correo y contraseña.");

      // Guardar token en localStorage si lo necesitas (opcional)
      if (data?.session?.access_token) {
        localStorage.setItem("token", data.session.access_token);
      }

      // Actualizar ultima_conexion en la tabla usuarios
      const userId = data?.user?.id || data?.session?.user?.id;
      if (userId) {
        await supabase.from("usuarios").update({ ultima_conexion: new Date().toISOString() }).eq("id", userId);
      }

      if (typeof onLogin === "function") onLogin();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error de conexión con Supabase.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de registro con Supabase
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: usuario,
        password,
      });
      if (signUpError) throw new Error(signUpError.message);

      // 2. Insertar datos extra en la tabla usuarios
      const { user } = signUpData;
      const userId = user?.id || signUpData?.user?.id || signUpData?.session?.user?.id;
      if (!userId) throw new Error("No se pudo obtener el ID del usuario");

      const { error: insertError } = await supabase.from("usuarios").insert([
        {
          id: userId,
          username: usuario,
          email: usuario,
          nombre,
          telefono,
          rol: "trabajador", // o el rol que desees por defecto
        },
      ]);
      if (insertError) throw new Error(insertError.message);

      setIsFlipped(false);
    } catch (err) {
      setError(err.message || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isFlipped ? 'theme-register' : ''}`}>
      <div className="card-container">
        <div className={`card-inner${isFlipped ? ' is-flipped' : ''}`}>
          {/* CARA FRONT: INICIAR SESIÓN */}
          <div className="card-face face-login">
            <div className="watermark-text">M&S</div>
            <div className="logo-watermark"></div>
            <div className="flex flex-col h-full relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-gradient mb-2 leading-tight">INGRESA<br/>SOFTCON-WM</h2>
                <div className="h-1.5 w-20" style={{background: 'var(--primary-color)'}}></div>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block mb-2">Usuario / Correo</label>
                  <input
                    type="email"
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    placeholder="ejemplo@dominio.com"
                    required
                    className={`input-custom w-full font-sans tracking-wide text-[14px] py-1.5 px-3 transition-all duration-150 ${
                      error
                        ? 'border-rose-400/80 focus:border-rose-400/80 focus:ring-rose-400/30'
                        : 'focus:border-[#8b5cf6] focus:ring-[#8b5cf6]/20'
                    }`}
                    style={{ minHeight: '32px', maxHeight: '36px' }}
                  />
                </div>
                <div>
                  <label className="block mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`input-custom w-full font-sans tracking-wide text-[14px] py-1.5 px-3 transition-all duration-150 ${
                      error
                        ? 'border-rose-400/80 focus:border-rose-400/80 focus:ring-rose-400/30'
                        : 'focus:border-[#8b5cf6] focus:ring-[#8b5cf6]/20'
                    }`}
                    style={{ minHeight: '32px', maxHeight: '36px' }}
                  />
                </div>
                <div className="t-auto pt-6 text-center border-t border-white/20">
                  <button
                    className="btn-custom w-full max-w-xs mt-4 py-1.5 text-[15px] font-black tracking-wide font-sans rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#facc15]/40 text-center"
                    style={{ minHeight: '36px', maxHeight: '40px' }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Acceder Ahora'}
                  </button>
                </div>
              </form>
              {/* Ejemplo: mostrar usuario conectado */}
              {/*
              <button
                className="mt-4 text-xs text-white opacity-80 center"
                onClick={async () => {
                  const user = await getCurrentUser();
                  alert(user ? `Conectado: ${user.email}` : 'No hay usuario conectado');
                }}
              >
                Ver usuario conectado
              </button>
              */}
              <div className="mt-auto pt-6 text-center border-t border-white/20">
                <p className="text-white text-sm">
                  ¿No tienes cuenta?
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="text-[var(--primary-color)] font-black hover:underline ml-1 uppercase text-xs"
                  >
                    Regístrate
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* CARA BACK: REGISTRO */}
          <div className="card-face face-register">
            <h2 className="text-2xl font-black text-gradient uppercase">Registro Maestro</h2>
            <form className="space-y-4 w-full mt-4" onSubmit={handleRegister}>
              {error && isFlipped && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </div>
              )}
              <label>Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre y Apellidos"
                required
                className="input-custom"
              />
              <label>Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+502 ..."
                required
                className="input-custom"
              />
              <label>Correo</label>
              <input
                type="email"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="ejemplo@dominio.com"
                required
                className="input-custom"
              />
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-custom"
              />
              <button className="btn-custom w-full mt-2" disabled={loading}>
                {loading ? "Registrando..." : "Finalizar Registro"}
              </button>
            </form>
            <button
              onClick={() => setIsFlipped(false)}
              className="mt-4 text-xs text-white opacity-80 underline"
            >
              ← Volver al Acceso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
