import { Database } from 'bun:sqlite'
import { unlinkSync } from 'fs'

// ask user for confirmation to delete the database that already exists
process.stdout.write('This operation will delete the database if it exists. Do you want to continue? (y/n): ')
for await (const answer of console) {
  if (answer.toLowerCase() === 'y'){
    break
  } else {
    console.log('Operation was canceled.')
    process.exit()
  } }

// delete the database file if it exists
try {
  unlinkSync('db/db.sqlite')
} catch (error) {
  console.error('Failed to delete the database file:', error);
} finally {
  console.log('Starting to create the database...');
}


const db = new Database('db/db.sqlite', { create: true, strict: true })

const queries = [
  `
  CREATE TABLE IF NOT EXISTS
    kanji (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character TEXT NOT NULL UNIQUE,
      chapter INTEGER,
      textbook_id INTEGER
    );
  `,
  `
  CREATE TABLE IF NOT EXISTS
    words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      chapter INTEGER,
      textbook_id INTEGER
    );
  `,
  `
  CREATE TABLE IF NOT EXISTS
    sentences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sentence TEXT NOT NULL UNIQUE,
      chapter INTEGER,
      textbook_id INTEGER
    );
  `,
  `
  CREATE TABLE IF NOT EXISTS
    textbooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
    );
  `,
  `
  CREATE TABLE IF NOT EXISTS
    kanji_words (
      kanji_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      PRIMARY KEY (kanji_id, word_id),
      FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE CASCADE,
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );
  `,
  `
  CREATE TABLE IF NOT EXISTS
    kanji_sentences (
      kanji_id INTEGER NOT NULL,
      sentence_id INTEGER NOT NULL,
      PRIMARY KEY (kanji_id, sentence_id),
      FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE CASCADE,
      FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE
    );
  `
]

const createTables = db.transaction(queries => {
  for (const query of queries) {
    db.prepare(query).run()
  }
})

createTables(queries)

console.log(`Database was created successfully.`)