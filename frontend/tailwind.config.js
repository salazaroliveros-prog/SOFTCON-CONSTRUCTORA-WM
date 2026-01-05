/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores del tema principal: Amarillo y Violeta Resplandeciente
        'softcon-primary': '#facc15', // Amarillo brillante
        'softcon-secondary': '#8b5cf6', // Violeta Resplandeciente
        'softcon-glow-main': 'rgba(139, 92, 246, 0.6)', // Glow principal

        // Colores del tema de registro: Morado y Azul
        'register-primary': '#a855f7',
        'register-secondary': '#3b82f6',
        'register-glow': 'rgba(168, 85, 247, 0.6)',

        // Colores del tema final: Refuerzo del resplandor
        'final-primary': '#facc15',
        'final-secondary': '#7c3aed',
        'final-glow': 'rgba(250, 204, 21, 0.8)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'], // Tu fuente original
        // O si quieres una más corporativa como 'Plus Jakarta Sans':
        // sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      // Backdrop blur personalizado si lo necesitas más allá de las opciones predefinidas
      backdropBlur: {
        '20': '20px', // Tailwind ya tiene un 'blur-xl' que es 24px, pero puedes definir más granular
      },
    },
  },
  plugins: [],
}
