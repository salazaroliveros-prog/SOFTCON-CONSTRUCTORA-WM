/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos SOFTCON-MYS-CONSTRU-WM
        'softcon-yellow': '#facc15', // Amarillo principal
        'softcon-purple': '#8b5cf6', // Violeta resplandeciente
        'softcon-dark': '#0f172a',   // Fondo elegante
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
