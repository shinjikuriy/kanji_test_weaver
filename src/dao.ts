import { Database } from 'bun:sqlite'

const db = new Database('db/db.sqlite', { create: false, strict: true })

export const selectKanjisByCharacter = db.prepare(`
  select
    kanjis.id, kanjis.character, textbooks.title, kanjis.chapter
    from kanjis
    join textbooks on kanjis.textbook_id = textbooks.id
  where kanjis.character = $character;
  `)

export const selectKanjisByChapter = db.prepare(`
  select
    kanjis.id, kanjis.character, textbooks.title, kanjis.chapter
    from kanjis
    join textbooks on kanjis.textbook_id = textbooks.id
  where kanjis.textbook_id = $textbookId
    and kanjis.chapter = $chapter
  order by kanjis.id;
  `)

export const selectWordsByKanjiId = db.prepare(`
  select words.id, words.word, textbooks.title, words.chapter
    from words
    join kanjis_words kw on words.id = kw.word_id
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
    JOIN kanjis_sentences ks on sentences.id = ks.sentence_id
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
  select distinct kanjis.chapter from kanjis where textbook_id = $textbookId order by kanjis.chapter;
  `)