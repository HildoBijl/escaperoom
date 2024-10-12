import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
      assets: "/src/assets",
      components: "/src/components",
      fb: "/src/firebase", // Do not use firebase to not get confused with the firebase package.
      game: "/src/game",
      pages: "/src/pages",
      routing: "/src/routing",
      styling: "/src/styling",
      util: "/src/util",
    },
  },
})
