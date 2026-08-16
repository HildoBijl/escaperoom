import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The lab is never part of the live site. It builds into its own deploy folder
// (deploy/lab/dist) which has its own firebase.json, so the root build that
// produces the live site can never pick it up.
const outDir = path.resolve(__dirname, '..', '..', 'deploy', 'lab', 'dist')

export default defineConfig({
  plugins: [react()],

  // Relative base: the build works on a preview channel root as well as on a
  // subpath later on, without a rebuild.
  base: './',

  build: {
    outDir,
    emptyOutDir: true,
  },

  server: {
    // 5173 (escape_a_2026) and 5174 (escape_b_2025) are taken.
    port: 5175,
  },
})
