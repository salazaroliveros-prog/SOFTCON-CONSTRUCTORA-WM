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
      alert("Registro exitoso. Revisa tu correo o inicia sesión.");
      setIsFlipped(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className={`card-container ${isFlipped ? "is-flipped" : ""}`}> 
        <div className="card-inner">
          {/* VISTA LOGIN */}
          <div className="card-face card-front glass-panel">
            <h2 className="brand-title">SOFTCON-MYS</h2>
            <p className="brand-slogan">CONSTRUYENDO TU FUTURO</p>
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
            <button data-testid="go-register-btn" onClick={() => setIsFlipped(true)} className="btn-link">¿No tienes cuenta? Regístrate</button>
          </div>
          {/* VISTA REGISTRO */}
          <div className="card-face card-back glass-panel">
            <h2 className="brand-title">Registro</h2>
            <form onSubmit={handleRegister} className="form-layout">
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
              <button type="submit" className="btn-custom" disabled={loading}>
                {loading ? "Procesando..." : "Crear Cuenta"}
              </button>
            </form>
            <button onClick={() => setIsFlipped(false)} className="btn-link">← Volver al Acceso</button>
          </div>
        </div>
      </div>
    </div>
  );
}
