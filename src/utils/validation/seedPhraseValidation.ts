import { z } from 'zod'
import { validateMnemonic } from '@scure/bip39'
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english'
import { closest } from 'fastest-levenshtein'

// The imported wordlist is already an array, no need to split
const wordlistArray = englishWordlist

/**
 * Supported seed phrase lengths according to BIP-39 standard
 */
export const VALID_SEED_PHRASE_LENGTHS = [ 12, 15, 18, 21, 24 ] as const

/**
 * Zod schema for seed phrase validation
 */
export const seedPhraseSchema = z.string().refine(
  (phrase) => {
    const normalized = normalizeSeedPhrase(phrase)
    return validateSeedPhrase(normalized).isValid
  },
  {
    message : 'Invalid seed phrase. Please check your words and try again.',
  }
)

/**
 * Type for validation result
 */
export interface SeedPhraseValidationResult {
  isValid: boolean
  errors: SeedPhraseValidationError[]
  normalizedPhrase?: string
}

/**
 * Types of validation errors
 */
export enum SeedPhraseValidationErrorType {
  EMPTY = 'EMPTY',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_WORD = 'INVALID_WORD',
  INVALID_CHECKSUM = 'INVALID_CHECKSUM',
}

/**
 * Validation error object
 */
export interface SeedPhraseValidationError {
  type: SeedPhraseValidationErrorType
  message: string
  details?: {
    index?: number
    word?: string
    suggestion?: string
  }
}

/**
 * Normalize a seed phrase by:
 * - Trimming whitespace
 * - Converting to lowercase
 * - Normalizing spaces (replacing multiple spaces with a single space)
 *
 * @param phrase - The seed phrase to normalize
 * @returns The normalized seed phrase
 */
export function normalizeSeedPhrase(phrase: string): string {
  return phrase
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
}

/**
 * Check if a word is in the BIP-39 wordlist
 *
 * @param word - The word to validate
 * @returns True if the word is in the wordlist
 */
export function isValidBip39Word(word: string): boolean {
  return wordlistArray.includes(word.toLowerCase())
}

/**
 * Find the closest valid word to an invalid word
 *
 * @param word - The invalid word
 * @returns The closest valid word from the BIP-39 wordlist
 */
export function getSuggestionForInvalidWord(word: string): string {
  if (!word || word.length < 2) return ''
  
  // Find the closest word in the wordlist
  return closest(word.toLowerCase(), wordlistArray)
}

/**
 * Validate a seed phrase
 *
 * @param phrase - The seed phrase to validate
 * @returns Validation result with validity flag and any errors
 */
export function validateSeedPhrase(phrase: string): SeedPhraseValidationResult {
  // Normalize the phrase first
  const normalizedPhrase = normalizeSeedPhrase(phrase)
  
  // Check if the phrase is empty
  if (!normalizedPhrase) {
    return {
      isValid : false,
      errors  : [
        {
          type    : SeedPhraseValidationErrorType.EMPTY,
          message : 'Seed phrase cannot be empty',
        },
      ],
    }
  }

  // Split the phrase into words
  const words = normalizedPhrase.split(' ')
  
  // Check if the phrase has a valid length
  if (!VALID_SEED_PHRASE_LENGTHS.includes(words.length as any)) {
    return {
      isValid : false,
      errors  : [
        {
          type    : SeedPhraseValidationErrorType.INVALID_LENGTH,
          message : `Seed phrase must contain ${VALID_SEED_PHRASE_LENGTHS.join(', ')} words`,
        },
      ],
      normalizedPhrase,
    }
  }

  // Check each word against the wordlist
  const invalidWords: SeedPhraseValidationError[] = words
    .map((word, index) => {
      if (!isValidBip39Word(word)) {
        return {
          type    : SeedPhraseValidationErrorType.INVALID_WORD,
          message : `"${word}" is not a valid BIP-39 word`,
          details : {
            index,
            word,
            suggestion : getSuggestionForInvalidWord(word),
          },
        }
      }
      return null
    })
    .filter(Boolean) as SeedPhraseValidationError[]

  // If there are invalid words, return them
  if (invalidWords.length > 0) {
    return {
      isValid : false,
      errors  : invalidWords,
      normalizedPhrase,
    }
  }

  // Finally, validate the entire mnemonic (this checks the checksum)
  try {
    const isValidMnemonic = validateMnemonic(normalizedPhrase, wordlistArray)
    
    if (!isValidMnemonic) {
      return {
        isValid : false,
        errors  : [
          {
            type    : SeedPhraseValidationErrorType.INVALID_CHECKSUM,
            message : 'Invalid seed phrase checksum',
          },
        ],
        normalizedPhrase,
      }
    }

    // All validations passed
    return {
      isValid : true,
      errors  : [],
      normalizedPhrase,
    }
  } catch (error) {
    console.error('Error validating seed phrase checksum:', error)
    return {
      isValid : false,
      errors  : [
        {
          type    : SeedPhraseValidationErrorType.INVALID_CHECKSUM,
          message : 'Error validating seed phrase',
        },
      ],
      normalizedPhrase,
    }
  }
}

/**
 * Get a user-friendly error message from validation errors
 *
 * @param errors - Array of validation errors
 * @returns A user-friendly error message
 */
export function getSeedPhraseErrorMessage(errors: SeedPhraseValidationError[]): string {
  if (!errors || errors.length === 0) return ''

  // Prioritize error types
  if (errors.some(e => e.type === SeedPhraseValidationErrorType.EMPTY)) {
    return 'Please enter your seed phrase.'
  }

  if (errors.some(e => e.type === SeedPhraseValidationErrorType.INVALID_LENGTH)) {
    return `Your seed phrase must have ${VALID_SEED_PHRASE_LENGTHS.join(', ')} words.`
  }

  if (errors.some(e => e.type === SeedPhraseValidationErrorType.INVALID_WORD)) {
    const invalidWords = errors
      .filter(e => e.type === SeedPhraseValidationErrorType.INVALID_WORD)
      .map(e => {
        if (e.details?.suggestion) {
          return `"${e.details.word}" (did you mean "${e.details.suggestion}"?)`
        }
        return `"${e.details?.word}"`
      })
      .join(', ')

    return `Invalid word(s) in seed phrase: ${invalidWords}.`
  }

  if (errors.some(e => e.type === SeedPhraseValidationErrorType.INVALID_CHECKSUM)) {
    return 'Invalid seed phrase. The words don\'t form a valid seed phrase.'
  }

  return 'Invalid seed phrase. Please check your words and try again.'
}

/**
 * Validate a seed phrase and return an object with validation status and errors
 *
 * @param phrase - The seed phrase to validate
 * @returns An object with validation result, errors and user-friendly error message
 */
export function validateSeedPhraseWithDetails(phrase: string): {
  isValid: boolean;
  normalizedPhrase: string;
  errors: SeedPhraseValidationError[];
  errorMessage: string;
} {
  const result = validateSeedPhrase(phrase)
  
  return {
    isValid          : result.isValid,
    normalizedPhrase : result.normalizedPhrase || '',
    errors           : result.errors,
    errorMessage     : getSeedPhraseErrorMessage(result.errors),
  }
} 