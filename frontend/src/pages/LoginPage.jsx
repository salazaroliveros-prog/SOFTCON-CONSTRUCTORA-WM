import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/services.js';
import AuthLayout from "../components/layout/AuthLayout";
import { Card, CardBody } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={["p-6 sm:p-8", className].join(" ")}>{children}</div>;
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-slate-100 outline-none",
        "placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-4 focus:ring-sky-400/10",
        className
      ].join(" ")}
      {...props}
    />
  );
}

export function Button({ className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-sky-500 text-white shadow-lg shadow-sky-500/10 hover:bg-sky-400 focus:ring-sky-400/20",
    ghost:
      "bg-transparent text-slate-200 hover:bg-white/5 border border-white/10 focus:ring-white/10"
  };

  return <button className={[base, variants[variant], className].join(" ")} {...props} />;
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
          </div>

          {children}

          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} SOFTCON
          </p>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aquí va la lógica de autenticación
      // Por ejemplo, llamar a una API para iniciar sesión
      await authApi.login({ usuario, password });
      navigate("/dashboard"); // Redirigir a la página de inicio después de iniciar sesión
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      // Manejar el error de inicio de sesión (por ejemplo, mostrar un mensaje de error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="SOFTCON-MYS-CONSTRU-WM">
      <Card>
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Usuario</label>
              <Input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="pt-2 text-sm text-slate-300">
              ¿No tienes cuenta?{" "}
              <a className="text-sky-300 hover:text-sky-200 underline underline-offset-4" href="/solicitar-acceso">
                Solicitar acceso
              </a>
            </div>
          </form>
        </CardBody>
      </Card>
    </AuthLayout>
  );
}
