import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/*', serveStatic({
  root: './',
  rewriteRequestPath: (path) => path.replace(/\/static/, 'dist/static'),
}))

app.get('/', (c) => {
  return c.html(
    <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Kanji Test Weaver</title>
      <script type="module" src="/static/client.js"></script>
    </head>
    <body></body>
    </html>
  )
})

export default app
