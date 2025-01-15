import { Database } from 'bun:sqlite'

const db = new Database('db/db.sqlite', { create: false, strict: true })

export const selectKanjiByCharacter = db.prepare(`
  select
    kanji.id, kanji.character, textbooks.title, kanji.chapter
    from kanji
    join textbooks on kanji.textbook_id = textbooks.id
  where kanji.character = $character;
  `)

export const selectKanjiByChapter = db.prepare(`
  select
    kanji.id, kanji.character, textbooks.title, kanji.chapter
    from kanji
    join textbooks on kanji.textbook_id = textbooks.id
  where kanji.textbook_id = $textbookId
    and kanji.chapter = $chapter
  order by kanji.id;
  `)

export const selectWordsByKanjiId = db.prepare(`
  select words.id, words.word, textbooks.title, words.chapter
    from words
    join kanji_words kw on words.id = kw.word_id
    join textbooks on words.textbook_id = textbooks.id
  where kw.kanji_id = $kanjiId
  order by words.id;
  `)

export const selectWordsByChapter = db.prepare(`
  select
    words.id, words.word, textbooks.title, words.chapter
    from words
    join textbooks on words.textbook_id = textbooks.id
  where words.textbook_id = $textbookId
    and words.chapter = $chapter
  order by words.id;
  `)

export const selectSentencesByKanjiId = db.prepare(`
  select sentences.id, sentences.sentence, textbooks.title, sentences.chapter
    from sentences
    JOIN kanji_sentences ks on sentences.id = ks.sentence_id
    JOIN textbooks on sentences.textbook_id = textbooks.id
  where ks.kanji_id = $kanjiId
  order by sentences.id;
  `)

export const selectSentencesByChapter = db.prepare(`
  select
    sentences.id, sentences.sentence, textbooks.title, sentences.chapter
    from sentences
    join textbooks on sentences.textbook_id = textbooks.id
  where sentences.textbook_id = $textbookId
    and sentences.chapter = $chapter
  order by sentences.id;
  `)

export const selectTextbooks = db.prepare(`
  select * from textbooks order by id;
  `)

export const selectChaptersByTextbookId = db.prepare(`
  select distinct kanji.chapter from kanji where textbook_id = $textbookId order by kanji.chapter;
  `)