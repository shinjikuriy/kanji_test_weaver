import { Database } from 'bun:sqlite'
import { parse } from 'csv-parse/sync'

const db = new Database('db/db.sqlite', { create: false, strict: true })

const kanji = parse(await Bun.file('csv/kanji.csv').text(), {
  columns: true,
  skip_empty_lines: true,
  cast: (value, context) => {
    if (context.column === 'chapter') {
      return parseInt(value)
    }
    return value
  }
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
  }
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
  }
})

// insert kanji data into the database
for (const row of kanji) {
  if(!row.character) throw new Error('character column is required')
  if(!row.textbook) throw new Error('textbook column is required')

  const title = row.textbook
  let textbook_id = db.prepare('SELECT id FROM textbooks WHERE title = ?').get(title)?.id
  if (!textbook_id) {
    textbook_id = db.prepare('INSERT INTO textbooks (title) VALUES (?)').run(title).lastInsertRowid
  }
  db.prepare('INSERT INTO kanji (character, chapter, textbook_id) VALUES (?, ?, ?) ON CONFLICT (character) DO NOTHING;').run(row.character, row.chapter, textbook_id)
}

// insert words data into the database
for (const row of words) {
  if(!row.word) throw new Error('word column is required')
  if(!row.textbook) throw new Error('textbook column is required')
  if(!row.chapter) throw new Error('chapter column is required')

  const result = db.prepare('SELECT id FROM textbooks WHERE title = ?').get(row.textbook)
  if (!result) {
    throw new Error(`Textbook not found: ${row.textbook}`)
  }
  db.prepare('INSERT INTO words (word, chapter, textbook_id) VALUES (?, ?, ?) ON CONFLICT (word) DO NOTHING;').run(row.word, row.chapter, result.id)
}

// insert sentences data into the database
for (const row of sentences) {
  if(!row.sentence) throw new Error('sentence column is required')
  if(!row.textbook) throw new Error('textbook column is required')
  if(!row.chapter) throw new Error('chapter column is required')

  const result = db.prepare('SELECT id FROM textbooks WHERE title = ?').get(row.textbook)
  if (!result) {
    throw new Error(`Textbook not found: ${row.textbook}`)
  }
  db.prepare('INSERT INTO sentences (sentence, chapter, textbook_id) VALUES (?, ?, ?) ON CONFLICT (sentence) DO NOTHING;').run(row.sentence, row.chapter, result.id)
}