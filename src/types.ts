export type Kanji = {
  id: number
  character: string
  chapter: number
  textbook: string
}

export type NewKanji = Omit<Kanji, 'id'>

export type Word = {
  id: number
  word: string
  chapter: number
  textbook: string
}

export type NewWord = Omit<Word, 'id'>

export type Sentence = {
  id: number
  sentence: string
  chapter: number
  textbook: string
}

export type NewSentence = Omit<Sentence, 'id'>

export type Textbook = {
  id: number
  title: string
}

export type NewTextbook = Omit<Textbook, 'id'>

export type KanjiWords = {
  kanjiId: number
  wordId: number
  kanji: Kanji
  word: Word
}

export type KanjiSentences = {
  kanjiId: number
  sentenceId: number
  kanji: Kanji
  sentence: Sentence
}

export type DatabaseSchema = {
  kanji: Omit<Kanji, 'textbook'> & { textbook_id: number }
  words: Omit<Word, 'textbook'> & { textbook_id: number }
  sentences: Omit<Sentence, 'textbook'> & { textbook_id: number }
  textbooks: Textbook
  kanji_words: Omit<KanjiWords, 'kanji' | 'word'>
  kanji_sentences: Omit<KanjiSentences, 'kanji' | 'sentence'>
}