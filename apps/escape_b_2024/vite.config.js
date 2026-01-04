// apps/escape_b_2024/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

// recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// repo root = two levels up: /projects/escaperoom
const repoRoot = path.resolve(__dirname, '..', '..')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kamp-b/',
  resolve: {
    alias: {
      // you *can* keep these, but better to make them absolute from THIS folder:
      src: path.resolve(__dirname, 'src'),
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      fb: path.resolve(__dirname, 'src/firebase'),
      game: path.resolve(__dirname, 'src/game'),
      pages: path.resolve(__dirname, 'src/pages'),
      routing: path.resolve(__dirname, 'src/routing'),
      styling: path.resolve(__dirname, 'src/styling'),
      util: path.resolve(__dirname, 'src/util'),
    },
  },
  server: {
    port: 5174,
    fs: {
      allow: [
        // this app itself
        __dirname,
        // root repo (so we can read root-level node_modules)
        repoRoot,
        // just to be extra explicit:
        path.join(repoRoot, 'node_modules'),
      ],
    },
  },
})
