import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css"; // Usa index.css para estilos globales y glassmorphism

export default function LoginPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Lógica de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Aquí va la lógica real de autenticación
      // await api.post("/auth/login", { usuario, password });
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Aquí va la lógica real de registro
      // await api.post("/auth/register", { nombre, telefono, usuario });
      setIsFlipped(false);
    } catch (err) {
      setError("Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isFlipped ? 'theme-register' : ''}`}>
      <div className="card-container">
        <div className={`card-inner glass-panel ${isFlipped ? 'is-flipped' : ''}`}>
          {/* CARA FRONT: INICIAR SESIÓN */}
          <div className="card-face face-login">
            <div className="watermark-text">M&S</div>
            <h2 className="text-4xl font-black text-gradient mb-4">INGRESA<br/>SOFTCON-WM</h2>
            <form onSubmit={handleLogin} className="space-y-4 w-full">
              {error && !isFlipped && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </div>
              )}
              <label>Usuario / Correo</label>
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
              <button className="btn-custom w-full" disabled={loading}>
                {loading ? "Entrando..." : "Acceder Ahora"}
              </button>
            </form>
            <p className="mt-6 text-sm text-white">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => setIsFlipped(true)}
                className="text-[#facc15] font-black"
              >
                REGÍSTRATE
              </button>
            </p>
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
