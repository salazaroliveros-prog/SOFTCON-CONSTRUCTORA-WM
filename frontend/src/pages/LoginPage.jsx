import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

import AuthLayout from "../components/layout/AuthLayout.jsx";
import { Card, CardBody } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";

export default function LoginPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Aquí va la lógica de autenticación
      // Por ejemplo, llamar a una API para iniciar sesión
      // const res = await api.post("/auth/login", { usuario, password });
      // localStorage.setItem("token", res.data.token);
      // navigate("/");

      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.detail || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="SOFTCON-MYS-CONSTRU-WM">
      <Card>
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

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
              <a
                className="underline underline-offset-4"
                href="/register"
              >
                Solicitar acceso
              </a>
            </div>
          </form>
        </CardBody>
      </Card>
    </AuthLayout>
  );
}
