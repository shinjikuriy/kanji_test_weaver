import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import * as dao from './dao'

const app = new Hono()

app.use(
  '/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (path) => path.replace(/\/static/, 'dist/static'),
  })
)

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

app.get('/api/textbooks', (c) => {
  const textbooks = dao.selectTextbooks.all()
  return c.json(textbooks)
})

app.get('/api/textbooks/:textbookId/chapters', (c) => {
  const { textbookId } = c.req.param()

  // check if textbookId is an integer
  if (!Number.isInteger(Number(textbookId))) {
    c.status(400)
    return c.json({ error: 'textbookId must be an integer' })
  }

  const chapters = dao.selectChaptersByTextbookId.all(Number(textbookId))
  return c.json(chapters)
})

export default app
