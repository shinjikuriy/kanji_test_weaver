import { Database } from 'bun:sqlite'

const db = new Database('db/db.sqlite', { create: false, strict: true })

export const selectKanjiByCharacter = db.prepare(`
  select
    kanji.id, kanji.character, textbooks.title, kanji.chapter
    from kanji
    join textbooks on kanji.textbook_id = textbooks.id
  where kanji.character = $character;
  `)

export const selectWordsByKanjiId = db.prepare(`
  select words.id, words.word, textbooks.title, words.chapter
    from words
    join kanji_words kw on words.id = kw.word_id
    join textbooks on words.textbook_id = textbooks.id
  where kw.kanji_id = $kanjiId;
  `)

export const selectSentencesByKanjiId = db.prepare(`
  select sentences.id, sentences.sentence, textbooks.title, sentences.chapter
    from sentences
    JOIN kanji_sentences ks on sentences.id = ks.sentence_id
    JOIN textbooks on sentences.textbook_id = textbooks.id
  where ks.kanji_id = $kanjiId;
  `)
