/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de SOFTCON-MYS-CONSTRU-WM
        'softcon-primary': '#facc15', // Amarillo brillante
        'softcon-secondary': '#8b5cf6', // Violeta Resplandeciente
        'softcon-glow-main': 'rgba(139, 92, 246, 0.6)', // Glow principal

        // Colores secundarios para estados
        'register-primary': '#a855f7',
        'register-secondary': '#3b82f6',
        'final-glow': 'rgba(250, 204, 21, 0.8)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
