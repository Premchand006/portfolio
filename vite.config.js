import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import react from '@vitejs/plugin-react'
import siteConfig from './vite-plugin-site-config.js'

/**
 * Dev-only: serve POST /api/assistant during `npm run dev`. Plain Vite does
 * not run Vercel serverless functions, so without this the Arceus / Omnibar
 * assistant would 404 locally and fall back to its placeholder reply. This
 * mirrors api/assistant.js using the shared core. The Gemini key is read
 * server-side (Node) and never reaches the client bundle.
 */
function devAssistantApi(geminiKey) {
  return {
    name: 'dev-assistant-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/assistant', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const send = (status, body) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (!geminiKey) return send(500, { ok: false, error: 'assistant_not_configured' })
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const raw = Buffer.concat(chunks).toString('utf8')
          const body = raw ? JSON.parse(raw) : {}
          const query = typeof body.query === 'string' ? body.query.trim().slice(0, 800) : ''
          if (!query || query.length < 2) return send(400, { ok: false, error: 'invalid_request' })

          // Resolve from cwd (project root) — robust whether or not Vite
          // bundles this config to a temp file.
          const data = JSON.parse(
            readFileSync(resolve(process.cwd(), 'src/config/site.config.json'), 'utf8')
          )
          const coreUrl = pathToFileURL(resolve(process.cwd(), 'api/_lib/assistant-core.js')).href
          const { askGemini } = await import(coreUrl)
          const { clean, section } = await askGemini({ apiKey: geminiKey, query, data })
          return send(200, { ok: true, reply: clean, suggestSection: section })
        } catch (err) {
          return send(500, { ok: false, error: 'assistant_unavailable', code: err.message })
        }
      })
    },
  }
}

/**
 * Vite config.
 *
 * Chunking strategy ─ Three.js + R3F + drei is the heaviest dependency
 * group (~600 kB raw). Split it into its own chunk so it can be cached
 * independently of UI code (which changes far more often), and so the
 * initial parse work happens on the same chunk every release. Same idea
 * for framer-motion and the React runtime.
 */
export default defineConfig(({ mode }) => {
  // Load every env var (incl. the non-VITE_ GEMINI_API_KEY) for the dev API.
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [react(), siteConfig(), devAssistantApi(env.GEMINI_API_KEY)],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return
          if (
            id.includes('three') ||
            id.includes('@react-three')
          ) return 'three-vendor'
          if (id.includes('framer-motion')) return 'motion-vendor'
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('scheduler')
          ) return 'react-vendor'
        },
      },
    },
  },
  server: {
    port: 5173,
  },
  }
})
