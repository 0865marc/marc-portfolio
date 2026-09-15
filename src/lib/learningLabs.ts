// Intentionally small, explicit examples: no inference, API calls or real model vocabulary.
export const tokenExamples = {
  words: ['La', 'IA', 'aprende', 'patrones', '.'],
  fragments: ['La', 'IA', 'apr', 'ende', 'pat', 'rones', '.'],
}
export const bagExamples = ['el gato persigue al perro', 'el perro persigue al gato']
export const bagVocabulary = ['el', 'gato', 'persigue', 'al', 'perro']
export const countWords = (sentence: string) => bagVocabulary.map(word => sentence.split(' ').filter(token => token === word).length)
export const attentionTokens = ['El', 'gato', 'mira', 'la', 'luna']
export const visiblePositions = (position: number, causal: boolean) => attentionTokens.map((_, index) => !causal || index <= position)
