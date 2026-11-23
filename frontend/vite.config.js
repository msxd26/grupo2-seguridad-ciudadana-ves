import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Redirige /api (REST y WebSocket /api/ws) al backend Express durante el desarrollo.
    proxy: { '/api': { target: 'http://localhost:3000', ws: true } },
  },
})
