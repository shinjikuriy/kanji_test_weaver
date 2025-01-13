import { Textbook } from '@types'
import { render } from 'hono/jsx/dom'
import { useState } from 'hono/jsx/dom'

function App() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const fetchTextbooks = async () => {
    const response = await fetch('/api/textbooks')
    if (!response.ok) {
      throw new Error('Failed to fetch textbooks')
    }
    const textbooks = await response.json()
    setTextbooks(textbooks)
  }

  const [chapters, setChapters] = useState<number[]>([])
  const fetchChapters = async (textbookId: number) => {
    const response = await fetch(`/api/textbooks/${textbookId}/chapters`)
    if (!response.ok) {
      throw new Error('Failed to fetch chapters')
    }
    const chapters = await response.json()
    setChapters(chapters.map((chapter: { chapter: number }) => chapter.chapter))
  }

  return (
    <>
      <div>
        <h1>Hello, World!</h1>
        <button onClick={fetchTextbooks}>show textbooks</button>
      </div>
      {textbooks.length > 0 && (
      <div>
        <h2>Textbooks</h2>
        <div>
          {textbooks.map((textbook) => (
            <button
              key={textbook.id}
              onClick={() => fetchChapters(textbook.id)}
            >
              {textbook.title}
            </button>
          ))}
        </div>
      </div>
      )}
      {chapters.length > 0 && (
        <div>
          <h2>Chapters</h2>
          <div>
            {chapters.map((chapter) => (
              <button key={chapter}>{chapter}</button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

render(<App />, document.body)
