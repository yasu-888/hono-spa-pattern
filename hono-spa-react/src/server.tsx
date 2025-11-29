import { serve } from '@hono/node-server'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './app'

const port = Number(process.env.PORT ?? 8787)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const staticRoot = path.resolve(__dirname, '../dist')

serve(
  {
    fetch: app.fetch,
    port
  },
  () => {
    console.log(`Listening on http://localhost:${port}`)
    console.log(`Serving static assets from ${staticRoot}/static`)
  }
)
