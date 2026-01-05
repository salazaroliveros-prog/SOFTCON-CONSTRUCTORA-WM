import React, { useState } from 'react';
import InputField from './InputField';
import GlassButton from './GlassButton';

const AuthCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(''); // 'theme-register', 'theme-final', ''

  const goToRegister = () => {
    setIsFlipped(true);
    setCurrentTheme('theme-register');
    document.body.classList.add('theme-register');
    document.body.classList.remove('theme-final');
  };

  const goToLogin = () => {
    setIsFlipped(false);
    setCurrentTheme('');
    document.body.classList.remove('theme-register');
    document.body.classList.remove('theme-final');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector('#btnRegister') as HTMLButtonElement;
    if (btn) btn.innerHTML = "PROCESANDO...";

    setTimeout(() => {
      alert("¡Usuario registrado con éxito!");

      setIsFlipped(false); // Volver al login automáticamente

      setTimeout(() => {
        setCurrentTheme('theme-final');
        document.body.classList.remove('theme-register');
        document.body.classList.add('theme-final');

        // Resetear formulario
        const form = e.target as HTMLFormElement;
        form.reset();
        if (btn) btn.innerHTML = "Finalizar Registro";
      }, 600); // Duración de la animación de volteo
    }, 1500);
  };

  return (
    <div className="card-container">
      <div className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}>
        {/* VISTA: INICIAR SESIÓN (AMARILLO Y VIOLETA) */}
        <div className="card-face face-login">
          <div className="watermark-text">M&S</div>
          <div className="logo-watermark"></div> {/* Tu imagen de fondo */}

          <div className="flex flex-col h-full relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-gradient mb-2 leading-tight">INGRESA<br/>SSC-M&S</h2>
              <div className="h-1.5 w-20 bg-[var(--primary-color)] mx-auto rounded-full shadow-lg"></div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <InputField
                label="Usuario / Correo"
                type="email"
                name="emailLogin"
                placeholder="ejemplo@dominio.com"
                required
              />
              <InputField
                label="Contraseña"
                type="password"
                name="passwordLogin"
                placeholder="••••••••"
                required
              />
              <GlassButton className="mt-4">
                Acceder Ahora
              </GlassButton>
            </form>

            <div className="mt-auto pt-6 text-center border-t border-white/20">
              <p className="text-white text-sm">
                ¿No tienes cuenta?
                <button onClick={goToRegister} className="text-[var(--primary-color)] font-black hover:underline ml-1 uppercase text-xs">Regístrate</button>
              </p>
            </div>
          </div>
        </div>

        {/* VISTA: REGISTRO (MORADO Y AZUL) */}
        <div className={`card-face face-register ${currentTheme === 'theme-register' ? 'theme-register' : ''}`}>
          <div className="watermark-text" style={{ opacity: 0.1 }}>M&S</div>
          <div className="logo-watermark"></div>

          <div className="flex flex-col h-full relative z-10">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-gradient uppercase italic">Registro Maestro</h2>
            </div>

            <form id="registerForm" onSubmit={handleRegister} className="form-content space-y-4">
              <InputField
                label="Nombre Completo"
                type="text"
                name="nombre"
                placeholder="Nombre y Apellidos"
                required
              />
              <InputField
                label="Cargo que desempeña"
                type="text"
                name="cargo_base"
                placeholder="Ej: Gerente General"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  label="Teléfono"
                  type="tel"
                  name="telefono"
                  placeholder="+502 ..."
                  required
                />
                <InputField
                  label="E-mail"
                  type="email"
                  name="email"
                  placeholder="user@servicios.com"
                  required
                />
              </div>

              <InputField
                label="Dependencia"
                type="select"
                name="dependencia"
                options={[
                  { value: "privada", label: "Entidad Privada" },
                  { value: "publica", label: "Entidad Pública" },
                ]}
              />

              <GlassButton type="submit" id="btnRegister" className="mt-4">
                Finalizar Registro
              </GlassButton>
            </form>

            <div className="text-center pt-3">
              <button onClick={goToLogin} className="text-white text-xs font-bold hover:underline opacity-80">
                ← Volver al Acceso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
