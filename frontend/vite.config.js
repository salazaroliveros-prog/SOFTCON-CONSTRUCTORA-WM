import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Asegúrate de que Vercel sirva esta carpeta
    emptyOutDir: true,
  },
  // Si tienes assets globales, ponlos en /frontend/public
  // Vite los copiará automáticamente al build final
  publicDir: 'public', // Es el valor por defecto, pero puedes especificarlo explícitamente
})
