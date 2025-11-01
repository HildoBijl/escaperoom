import { defineConfig } from 'vite'

export default defineConfig(() => ({
  // base: '/2025/',
  server: {
    port: 5173,
    proxy: {
      '/2024': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
}))
