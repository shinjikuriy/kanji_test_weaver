import { Kanji, Sentence, Textbook, Word } from '@types'
import { render } from 'hono/jsx/dom'
import { useState } from 'hono/jsx/dom'

function App() {
  const [selected, setSelected] = useState<{
    textbook?: Textbook
    chapter?: number
  }>({})

  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const fetchTextbooks = async () => {
    const response = await fetch('/api/textbooks')
    if (!response.ok) {
      throw new Error('Failed to fetch textbooks')
    }
    const textbooks = await response.json()
    setTextbooks(textbooks)
    setSelected({})
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

  const [kanjis, setKanjis] = useState<Kanji[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [sentences, setSentences] = useState<Sentence[]>([])

  const fetchChapterContents = async (textbookId: number, chapter: number) => {
    const response = await fetch(
      `/api/textbooks/${textbookId}/chapters/${chapter}/contents`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch chapter contents')
    }
    const { kanjis, words, sentences } = await response.json()
    setKanjis(kanjis)
    setWords(words)
    setSentences(sentences)
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
                onClick={() => {
                  fetchChapters(textbook.id)
                  setSelected({ textbook })
                }}
              >
                {textbook.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.textbook && (
        <div>
          <h2>Chapters in {selected.textbook.title}</h2>
          <div>
            {chapters.map((chapter) => (
              <button
                key={chapter}
                onClick={() => {
                  if (selected.textbook) {
                    fetchChapterContents(selected.textbook.id, chapter)
                    setSelected(({ textbook }) => ({ textbook, chapter }))
                  }
                }}
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.chapter && (
        <>
          <div>
            <h2>Kanji in chapter {selected.chapter}</h2>
            <p>{kanjis.map((k) => k.character).join(', ')}</p>
          </div>
          <div>
            <h2>Words in chapter {selected.chapter}</h2>
            <div>
              {words.map((word) => (
                <button key={word.id}>{word.word}</button>
              ))}
            </div>
          </div>
          <div>
            <h2>Sentences in chapter {selected.chapter}</h2>
            <div>
              {sentences.map((s) => (
                <button key={s.id}>{s.sentence}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

render(<App />, document.body)
