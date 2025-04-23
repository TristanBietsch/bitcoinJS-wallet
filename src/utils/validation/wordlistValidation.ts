import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english'
import { wordlist as spanishWordlist } from '@scure/bip39/wordlists/spanish'
import { wordlist as frenchWordlist } from '@scure/bip39/wordlists/french'
import { wordlist as italianWordlist } from '@scure/bip39/wordlists/italian'
import { wordlist as japaneseWordlist } from '@scure/bip39/wordlists/japanese'
import { wordlist as koreanWordlist } from '@scure/bip39/wordlists/korean'
import { wordlist as chineseSimplifiedWordlist } from '@scure/bip39/wordlists/simplified-chinese'
import { wordlist as chineseTraditionalWordlist } from '@scure/bip39/wordlists/traditional-chinese'
import { wordlist as czechWordlist } from '@scure/bip39/wordlists/czech'
import { wordlist as portugueseWordlist } from '@scure/bip39/wordlists/portuguese'
import { closest, distance } from 'fastest-levenshtein'

/**
 * Supported BIP-39 wordlist languages
 */
export enum WordlistLanguage {
  ENGLISH = 'english',
  SPANISH = 'spanish',
  FRENCH = 'french',
  ITALIAN = 'italian',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  CHINESE_SIMPLIFIED = 'chinese_simplified',
  CHINESE_TRADITIONAL = 'chinese_traditional',
  CZECH = 'czech',
  PORTUGUESE = 'portuguese'
}

/**
 * Map of wordlists by language
 */
export const wordlists: Record<WordlistLanguage, string[]> = {
  [WordlistLanguage.ENGLISH]             : englishWordlist,
  [WordlistLanguage.SPANISH]             : spanishWordlist,
  [WordlistLanguage.FRENCH]              : frenchWordlist,
  [WordlistLanguage.ITALIAN]             : italianWordlist,
  [WordlistLanguage.JAPANESE]            : japaneseWordlist,
  [WordlistLanguage.KOREAN]              : koreanWordlist,
  [WordlistLanguage.CHINESE_SIMPLIFIED]  : chineseSimplifiedWordlist,
  [WordlistLanguage.CHINESE_TRADITIONAL] : chineseTraditionalWordlist,
  [WordlistLanguage.CZECH]               : czechWordlist,
  [WordlistLanguage.PORTUGUESE]          : portugueseWordlist
}

/**
 * Default wordlist to use when no language is specified
 */
export const DEFAULT_WORDLIST_LANGUAGE = WordlistLanguage.ENGLISH

/**
 * Get the wordlist for a specific language
 * 
 * @param language - The language to get the wordlist for
 * @returns The wordlist for the specified language
 */
export function getWordlist(language: WordlistLanguage = DEFAULT_WORDLIST_LANGUAGE): string[] {
  return wordlists[language]
}

/**
 * Create a prefix trie from a wordlist for efficient prefix-based lookups
 * This is an optimization for word suggestions and autocompletion
 */
interface TrieNode {
  word?: string;
  children: Map<string, TrieNode>;
}

// Cache for tries built from wordlists
const trieCache: Partial<Record<WordlistLanguage, TrieNode>> = {}

/**
 * Build a trie from a wordlist (or get from cache)
 * 
 * @param language - The language to build the trie for
 * @returns The root node of the trie
 */
function getWordlistTrie(language: WordlistLanguage = DEFAULT_WORDLIST_LANGUAGE): TrieNode {
  // Return from cache if already built
  if (trieCache[language]) {
    return trieCache[language]!
  }
  
  const wordlist = getWordlist(language)
  const root: TrieNode = { children: new Map() }
  
  // Build the trie
  for (const word of wordlist) {
    let node = root
    
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map() })
      }
      node = node.children.get(char)!
    }
    
    node.word = word
  }
  
  // Cache the trie
  trieCache[language] = root
  return root
}

/**
 * Check if a word exists in the specified wordlist
 * 
 * @param word - The word to check
 * @param language - The language wordlist to check against
 * @returns True if the word exists in the wordlist
 */
export function isWordInWordlist(
  word: string, 
  language: WordlistLanguage = DEFAULT_WORDLIST_LANGUAGE
): boolean {
  if (!word) return false
  
  const normalizedWord = word.toLowerCase().trim()
  const wordlist = getWordlist(language)
  
  return wordlist.includes(normalizedWord)
}

/**
 * Find the closest matching word in the wordlist for a given input
 * 
 * @param word - The input word to find a match for
 * @param language - The language wordlist to use
 * @returns The closest matching word from the wordlist
 */
export function getSuggestionForInvalidWord(
  word: string,
  language: WordlistLanguage = DEFAULT_WORDLIST_LANGUAGE
): string {
  if (!word || word.length < 2) return ''
  
  const normalizedWord = word.toLowerCase().trim()
  const wordlist = getWordlist(language)
  
  return closest(normalizedWord, wordlist)
}

/**
 * Get multiple word suggestions for an invalid word with optimized performance
 * This implementation uses a combination of prefix matching and Levenshtein distance
 * for better performance with large wordlists
 * 
 * @param word - The invalid word to get suggestions for
 * @param count - The number of suggestions to return
 * @param language - The language wordlist to use
 * @returns An array of word suggestions
 */
export function getWordSuggestions(
  word: string,
  count: number = 3,
  language: WordlistLanguage = DEFAULT_WORDLIST_LANGUAGE
): string[] {
  if (!word || word.length < 2) return []
  
  const normalizedWord = word.toLowerCase().trim()
  
  // Strategy 1: First try prefix matching (much faster)
  const prefixMatches = getWordsByPrefix(normalizedWord, count, language)
  if (prefixMatches.length === count) {
    return prefixMatches
  }
  
  // Strategy 2: For remaining slots, use Levenshtein distance
  // Optimization: Only compute distance for words with similar length
  const wordlist = getWordlist(language)
  const lengthThreshold = 2 // Words within ±2 characters of the input
  const candidateWords = wordlist.filter(w => 
    !prefixMatches.includes(w) && 
    Math.abs(w.length - normalizedWord.length) <= lengthThreshold
  )
  
  // Compute distances only for the filtered candidates
  const distanceMatches = candidateWords
    .map(dictWord => ({
      word     : dictWord,
      // Using fastest-levenshtein library for optimal performance
      distance : distance(normalizedWord, dictWord)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count - prefixMatches.length)
    .map(item => item.word)
  
  // Combine prefix matches with distance matches
  return [ ...prefixMatches, ...distanceMatches ]
}

/**
 * Get the prefix-based matches for a partial word
 * Uses the trie data structure for efficient lookup
 * 
 * @param prefix - The word prefix to match
 * @param limit - Maximum number of matches to return
 * @param language - The language wordlist to use
 * @returns Array of matching words that start with the prefix
 */
export function getWordsByPrefix(
  prefix: string,
  limit: number = 10,
  language: WordlistLanguage = DEFAULT_WORDLIST_LANGUAGE
): string[] {
  if (!prefix) return []
  
  const normalizedPrefix = prefix.toLowerCase().trim()
  
  // Get the trie for this language
  const trie = getWordlistTrie(language)
  
  // Navigate to the node corresponding to the prefix
  let node = trie
  for (const char of normalizedPrefix) {
    if (!node.children.has(char)) {
      return [] // No matches for this prefix
    }
    node = node.children.get(char)!
  }
  
  // Collect words from this node and its children
  const words: string[] = []
  
  // Helper function to traverse the trie and collect words
  function collectWords(node: TrieNode): void {
    if (words.length >= limit) return
    
    if (node.word) {
      words.push(node.word)
    }
    
    for (const childNode of node.children.values()) {
      collectWords(childNode)
    }
  }
  
  collectWords(node)
  return words
}

/**
 * Detect the most likely language of a seed phrase
 * 
 * @param seedPhrase - The seed phrase to analyze
 * @returns The most likely language or undefined if can't determine
 */
export function detectWordlistLanguage(seedPhrase: string): WordlistLanguage | undefined {
  if (!seedPhrase) return undefined
  
  const words = seedPhrase.toLowerCase().trim().split(/\s+/)
  const languageMatches = Object.entries(wordlists).map(([ language, wordlist ]) => {
    const matchCount = words.filter(word => wordlist.includes(word)).length
    return {
      language   : language as WordlistLanguage,
      matchRatio : matchCount / words.length
    }
  })
  
  // Find the language with the highest match ratio
  const bestMatch = languageMatches.reduce((best, current) => 
    current.matchRatio > best.matchRatio ? current : best
  , { language: undefined as WordlistLanguage | undefined, matchRatio: 0 })
  
  // Only return a language if it matches at least 70% of words
  return bestMatch.matchRatio >= 0.7 ? bestMatch.language : undefined
} 