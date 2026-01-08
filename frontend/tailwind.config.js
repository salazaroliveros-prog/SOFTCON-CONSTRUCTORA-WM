/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'max-w-md',
  ],
  theme: {
    extend: {
      colors: {
        // Colores de SOFTCON-MYS-CONSTRU-WM
        softcon: {
          primary: '#facc15', // Amarillo brillante
          secondary: '#8b5cf6', // Violeta Resplandeciente
          glowMain: 'rgba(139, 92, 246, 0.6)', // Glow principal
        },
        register: {
          primary: '#a855f7',
          secondary: '#3b82f6',
        },
        finalGlow: 'rgba(250, 204, 21, 0.8)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
