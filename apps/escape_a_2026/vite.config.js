import { defineConfig } from 'vite'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

function imageOptimizer({ quality = 80, maxWidth = 1280 } = {}) {
  let resolvedOutDir

  return [
    // Dev: serve .png when .webp is requested (originals stay as PNG in public/)
    {
      name: 'image-optimizer:dev',
      apply: 'serve',
      configureServer(server) {
        const publicDir = path.resolve(server.config.root, 'public')
        server.middlewares.use((req, res, next) => {
          const urlPath = (req.url || '').split('?')[0]
          if (urlPath.endsWith('.webp')) {
            const webpFile = path.join(publicDir, decodeURIComponent(urlPath))
            if (!fs.existsSync(webpFile)) {
              req.url = req.url.replace('.webp', '.png')
            }
          }
          next()
        })
      }
    },
    // Build: convert PNGs to WebP in output
    {
      name: 'image-optimizer:build',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = path.resolve(config.root, config.build.outDir)
      },
      async closeBundle() {
        const assetsDir = path.join(resolvedOutDir, 'assets')
        if (!fs.existsSync(assetsDir)) return

        const pngFiles = findFiles(assetsDir, '.png')
        if (pngFiles.length === 0) return

        console.log(`\nOptimizing ${pngFiles.length} images...`)
        let totalBefore = 0
        let totalAfter = 0

        for (const file of pngFiles) {
          const stats = fs.statSync(file)
          totalBefore += stats.size

          const webpPath = file.replace(/\.png$/, '.webp')
          const metadata = await sharp(file).metadata()

          let pipeline = sharp(file)
          if (metadata.width > maxWidth) {
            pipeline = pipeline.resize({ width: maxWidth })
          }

          await pipeline.webp({ quality }).toFile(webpPath)

          const webpStats = fs.statSync(webpPath)
          totalAfter += webpStats.size

          fs.unlinkSync(file)
        }

        const beforeMB = (totalBefore / 1024 / 1024).toFixed(1)
        const afterMB = (totalAfter / 1024 / 1024).toFixed(1)
        const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)
        console.log(`  ${beforeMB}MB → ${afterMB}MB (saved ${savedMB}MB)\n`)
      }
    }
  ]
}

function findFiles(dir, ext) {
  let results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(findFiles(fullPath, ext))
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath)
    }
  }
  return results
}

export default defineConfig(() => ({
  plugins: [imageOptimizer()],
  server: {
    port: 5173,
    proxy: {
      '/kamp-b': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
}))
