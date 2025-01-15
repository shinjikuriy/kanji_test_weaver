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

app.get('/api/textbooks/:textbookId/chapters/:chapter/kanji', (c) => {
  const { textbookId, chapter } = c.req.param()

  // check if textbookId and chapter are integers
  if (!Number.isInteger(Number(textbookId)) || !Number.isInteger(Number(chapter))) {
    c.status(400)
    return c.json({ error: 'textbookId and chapter must be integers' })
  }

  const kanji = dao.selectKanjiByChapter.all({ textbookId: Number(textbookId), chapter: Number(chapter) })
  return c.json(kanji)
})

app.get('/api/textbooks/:textbookId/chapters/:chapter/words', (c) => {
  const { textbookId, chapter } = c.req.param()

  // check if textbookId and chapter are integers
  if (!Number.isInteger(Number(textbookId)) || !Number.isInteger(Number(chapter))) {
    c.status(400)
    return c.json({ error: 'textbookId and chapter must be integers' })
  }

  const words = dao.selectWordsByChapter.all({ textbookId: Number(textbookId), chapter: Number(chapter) })
  return c.json(words)
})

app.get('/api/textbooks/:textbookId/chapters/:chapter/sentences', (c) => {
  const { textbookId, chapter } = c.req.param()

  // check if textbookId and chapter are integers
  if (!Number.isInteger(Number(textbookId)) || !Number.isInteger(Number(chapter))) {
    c.status(400)
    return c.json({ error: 'textbookId and chapter must be integers' })
  }

  const sentences = dao.selectSentencesByChapter.all({ textbookId: Number(textbookId), chapter: Number(chapter) })
  return c.json(sentences)
})

app.get('/api/textbooks/:textbookId/chapters/:chapter/contents', (c) => {
  const { textbookId, chapter } = c.req.param()

  // check if textbookId and chapter are integers
  if (!Number.isInteger(Number(textbookId)) || !Number.isInteger(Number(chapter))) {
    c.status(400)
    return c.json({ error: 'textbookId and chapter must be integers' })
  }

  const kanji = dao.selectKanjiByChapter.all({ textbookId: Number(textbookId), chapter: Number(chapter) })
  const words = dao.selectWordsByChapter.all({ textbookId: Number(textbookId), chapter: Number(chapter) })
  const sentences = dao.selectSentencesByChapter.all({ textbookId: Number(textbookId), chapter: Number(chapter) })

  return c.json({ kanji, words, sentences })
})

export default app
