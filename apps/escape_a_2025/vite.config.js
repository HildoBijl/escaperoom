import { defineConfig } from 'vite'

export default defineConfig(() => ({
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
