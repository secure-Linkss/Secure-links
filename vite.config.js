import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    origin: "https://5173-iouhdad7fk4xpd7hy1d81-dc3dc737.manusvm.computer",
    hmr: {
      protocol: "wss",
      host: "5173-i77igszn2sjinwgof9wo8-28fef25c.manus.computer",
      clientPort: 443,
    },
    allowedHosts: [
      "5173-iouhdad7fk4xpd7hy1d81-dc3dc737.manusvm.computer"
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
