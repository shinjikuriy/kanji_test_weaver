import { Database } from 'bun:sqlite'
import { parse } from 'csv-parse/sync'
import { DatabaseSchema } from '@types'

const db = new Database('db/db.sqlite', { create: false, strict: true })

const kanji = parse(await Bun.file('csv/kanji.csv').text(), {
  columns: true,
  skip_empty_lines: true,
  cast: (value, context) => {
    if (context.column === 'chapter') {
      return parseInt(value)
    }
    return value
  },
})

const words = parse(await Bun.file('csv/words.csv').text(), {
  columns: true,
  skip_empty_lines: true,
  cast: (value, context) => {
    if (context.column === 'chapter') {
      return parseInt(value)
    } else if (context.column === 'except') {
      return value || null
    }
    return value
  },
})

const sentences = parse(await Bun.file('csv/sentences.csv').text(), {
  columns: true,
  skip_empty_lines: true,
  cast: (value, context) => {
    if (context.column === 'chapter') {
      return parseInt(value)
    } else if (context.column === 'except') {
      return value || null
    }
    return value
  },
})

// insert kanji data into the database
for (const row of kanji) {
  if (!row.character) throw new Error('character column is required')
  if (!row.textbook) throw new Error('textbook column is required')

  const title = row.textbook
  let textbook_id = (
    db.prepare('SELECT id FROM textbooks WHERE title = ?').get(title) as
      | { id: number | bigint }
      | undefined
  )?.id
  if (!textbook_id) {
    textbook_id = db
      .prepare('INSERT INTO textbooks (title) VALUES (?)')
      .run(title).lastInsertRowid
  }
  db.prepare(
    'INSERT INTO kanji (character, chapter, textbook_id) VALUES (?, ?, ?) ON CONFLICT (character) DO NOTHING;'
  ).run(row.character, row.chapter, textbook_id)
}

// insert words data into the database
for (const row of words) {
  if (!row.word) throw new Error('word column is required')
  if (!row.textbook) throw new Error('textbook column is required')
  if (!row.chapter) throw new Error('chapter column is required')

  const result = db
    .prepare('SELECT id FROM textbooks WHERE title = ?')
    .get(row.textbook) as { id: number | bigint } | undefined
  if (!result) {
    throw new Error(`Textbook not found: ${row.textbook}`)
  }
  db.prepare(
    'INSERT INTO words (word, chapter, textbook_id) VALUES (?, ?, ?) ON CONFLICT (word) DO NOTHING;'
  ).run(row.word, row.chapter, result.id)
}

// insert sentences data into the database
for (const row of sentences) {
  if (!row.sentence) throw new Error('sentence column is required')
  if (!row.textbook) throw new Error('textbook column is required')
  if (!row.chapter) throw new Error('chapter column is required')

  const result = db
    .prepare('SELECT id FROM textbooks WHERE title = ?')
    .get(row.textbook) as { id: number | bigint } | undefined
  if (!result) {
    throw new Error(`Textbook not found: ${row.textbook}`)
  }
  db.prepare(
    'INSERT INTO sentences (sentence, chapter, textbook_id) VALUES (?, ?, ?) ON CONFLICT (sentence) DO NOTHING;'
  ).run(row.sentence, row.chapter, result.id)
}

// prepare join tables
const allKanji = db
  .prepare(`select * from kanji order by textbook_id asc, chapter asc`)
  .all()
const allWords = db
  .prepare(`select * from words order by textbook_id asc, chapter asc`)
  .all()
const allSentences = db.prepare(`select * from sentences`).all()

// insert kanji_words data into the database
for (const kanji of allKanji as DatabaseSchema['kanji'][]) {
  for (const word of allWords as DatabaseSchema['words'][]) {
    if (
      kanji.textbook_id !== word.textbook_id ||
      kanji.chapter !== word.chapter
    )
      continue

    if (word.word.includes(kanji.character)) {
      db.prepare(
        'INSERT INTO kanji_words (kanji_id, word_id) VALUES (?, ?) ON CONFLICT (kanji_id, word_id) DO NOTHING;'
      ).run(kanji.id, word.id)
    }
  }
}

// insert kanji_sentences data into the database
for (const kanji of allKanji as DatabaseSchema['kanji'][]) {
  for (const sentence of allSentences as DatabaseSchema['sentences'][]) {
    if (
      kanji.textbook_id !== sentence.textbook_id ||
      kanji.chapter !== sentence.chapter
    )
      continue

    if (sentence.sentence.includes(kanji.character)) {
      db.prepare(
        'INSERT INTO kanji_sentences (kanji_id, sentence_id) VALUES (?, ?) ON CONFLICT (kanji_id, sentence_id) DO NOTHING;'
      ).run(kanji.id, sentence.id)
    }
  }
}
