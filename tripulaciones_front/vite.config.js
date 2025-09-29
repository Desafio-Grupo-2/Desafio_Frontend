import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/predict': {
        target: 'https://desafio-reto2.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/predict/, '/predict_batch'),
      },
    },
  },
  optimizeDeps: {
    include: ['leaflet', 'leaflet-rotatedmarker'],
  },
  define: {
    global: 'globalThis',
  },
})