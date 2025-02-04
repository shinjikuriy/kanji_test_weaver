import { Kanji, Sentence, Textbook, Word } from '@types'
import { render } from 'hono/jsx/dom'
import { useState } from 'hono/jsx/dom'

interface SelectableKanji extends Kanji {
  selected: boolean
}

interface SelectableWord extends Word {
  selected: boolean
  disabled: boolean
}

interface SelectableSentence extends Sentence {
  selected: boolean
  disabled: boolean
}

function App() {
  const [selected, setSelected] = useState<{
    textbook?: Textbook
    chapter?: number
  }>({})

  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const handleFetchTextbook = async () => {
    const response = await fetch('/api/textbooks')
    if (!response.ok) {
      throw new Error('Failed to fetch textbooks')
    }
    const textbooks = await response.json()
    setTextbooks(textbooks)
    setSelected({})
  }

  const [chapters, setChapters] = useState<number[]>([])
  const handleFetchChapters = async (textbookId: number) => {
    const response = await fetch(`/api/textbooks/${textbookId}/chapters`)
    if (!response.ok) {
      throw new Error('Failed to fetch chapters')
    }
    const chapters = await response.json()
    setChapters(chapters.map((chapter: { chapter: number }) => chapter.chapter))
    setWords([])
    setSentences([])
  }

  const [kanjis, setKanjis] = useState<SelectableKanji[]>([])
  const [words, setWords] = useState<SelectableWord[]>([])
  const [sentences, setSentences] = useState<SelectableSentence[]>([])

  const handleFetchChapterContents = async (
    textbookId: number,
    chapter: number
  ) => {
    const response = await fetch(
      `/api/textbooks/${textbookId}/chapters/${chapter}/contents`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch chapter contents')
    }
    const { kanjis, words, sentences } = await response.json()
    setKanjis(
      kanjis.map((k: Kanji) => ({ ...k, selected: false } as SelectableKanji))
    )
    setWords(
      words.map((w: Word) => ({ ...w, selected: false } as SelectableWord))
    )
    setSentences(
      sentences.map(
        (s: Sentence) => ({ ...s, selected: false } as SelectableSentence)
      )
    )
  }

  const handleWordSelection = (word: SelectableWord) => {
    setWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, selected: !w.selected } : w))
    )

    const updatedWords = words.map((w) =>
      w.id === word.id ? { ...w, selected: !w.selected } : w
    )

    const updatedKanjis = kanjis.map((kanji) => ({
      ...kanji,
      selected:
        updatedWords.some(
          (w) => w.selected && w.word.includes(kanji.character)
        ) ||
        sentences.some(
          (s) => s.selected && s.sentence.includes(kanji.character)
        ),
    }))

    setKanjis(updatedKanjis)
  }

  const handleSentenceSelection = (sentence: SelectableSentence) => {
    setSentences((prev) =>
      prev.map((s) =>
        s.id === sentence.id ? { ...s, selected: !s.selected } : s
      )
    )

    const updatedSentences = sentences.map((s) =>
      s.id === sentence.id ? { ...s, selected: !s.selected } : s
    )

    const updatedKanjis = kanjis.map((kanji) => ({
      ...kanji,
      selected:
        words.some((w) => w.selected && w.word.includes(kanji.character)) ||
        updatedSentences.some(
          (s) => s.selected && s.sentence.includes(kanji.character)
        ),
    }))

    setKanjis(updatedKanjis)
  }

  function handleToggleSelectedSentence(sentence: SelectableSentence) {
    setSentences((sentences) =>
      sentences.map((s) =>
        s.id === sentence.id ? { ...s, selected: !s.selected } : s
      )
    )
  }

  function handleUpdateChapterContents() {
    const getSelectedItems = <T extends { selected: boolean }>(items: T[]) =>
      items.filter((item) => item.selected)

    const isKanjiIncluded = (character: string, text: string) =>
      text.includes(character)

    const isKanjiInSelectedItems = (character: string) => {
      const selectedWords = getSelectedItems(words)
      const selectedSentences = getSelectedItems(sentences)

      return (
        selectedWords.some((word) => isKanjiIncluded(character, word.word)) ||
        selectedSentences.some((sentence) =>
          isKanjiIncluded(character, sentence.sentence)
        )
      )
    }

    setKanjis(
      kanjis.map((kanji) => ({
        ...kanji,
        selected: isKanjiInSelectedItems(kanji.character),
      }))
    )
  }

  return (
    <>
      <div>
        <h1>Hello, World!</h1>
        <button onClick={handleFetchTextbook}>show textbooks</button>
      </div>
      {textbooks.length > 0 && (
        <div>
          <h2>Textbooks</h2>
          <div>
            {textbooks.map((textbook) => (
              <button
                key={textbook.id}
                onClick={() => {
                  handleFetchChapters(textbook.id)
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
                    handleFetchChapterContents(selected.textbook.id, chapter)
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
            <p>
              {kanjis
                .map((k) => (
                  <span
                    key={k.character}
                    style={k.selected ? { color: 'red' } : undefined}
                  >
                    {k.character}
                  </span>
                ))
                .reduce((prev, curr) => (
                  <>
                    {prev}, {curr}
                  </>
                ))}
            </p>
          </div>
          <div>
            <h2>Words in chapter {selected.chapter}</h2>
            <div>
              {words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleWordSelection(word)}
                  style={word.selected ? { color: 'red' } : undefined}
                >
                  {word.word}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2>Sentences in chapter {selected.chapter}</h2>
            <div>
              {sentences.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSentenceSelection(s)}
                  style={s.selected ? { color: 'red' } : undefined}
                >
                  {s.sentence}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

render(<App />, document.body)
