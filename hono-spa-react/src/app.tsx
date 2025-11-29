import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { renderToString } from 'react-dom/server'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Shared Hono app used by both Vite dev server and the production Node server
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'
const distRoot = path.resolve(__dirname, '../dist')

const app = new Hono()

// In production we serve the built assets ourselves; in dev Vite serves them.
if (!isDev) {
  app.use('/static/*', serveStatic({ root: distRoot }))
}

app.post('/api/chat', async (c) => {
  let body: { message?: string } | null = null
  try {
    body = await c.req.json<{ message?: string }>()
  } catch {
    body = null
  }

  const message = body?.message?.trim()
  if (!message) {
    return c.json({ error: 'message は必須です' }, 400)
  }

  // Echo reply; swap with Gemini or other LLM as needed.
  const reply = `Echo: ${message}`
  return c.json({ reply })
})

app.get('*', (c) => {
  const clientScript = isDev ? '/src/client.tsx' : '/static/client.js'
  const clientStyle = isDev ? '/src/style.css' : '/static/style.css'

  return c.html(
    renderToString(
      <html lang="ja">
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <title>Hono + React Sample</title>
          <link rel="stylesheet" href={clientStyle} />
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src={clientScript}></script>
        </body>
      </html>
    )
  )
})

export default app
export const fetch = app.fetch
