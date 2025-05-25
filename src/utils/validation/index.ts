// Import and re-export from seedPhraseValidation
import { 
  validateSeedPhrase,
  validateSeedPhraseWithDetails,
  normalizeSeedPhrase,
  isValidBip39Word,
  seedPhraseSchema,
  VALID_SEED_PHRASE_LENGTHS,
  // Rename to avoid conflict
  getSuggestionForInvalidWord as getSeedPhraseSuggestion
} from './seedPhraseValidation'

// Import and re-export from wordlistValidation
import {
  WordlistLanguage,
  getWordlist,
  isWordInWordlist,
  getSuggestionForInvalidWord as getWordlistSuggestion,
  getWordSuggestions,
  getWordsByPrefix,
  detectWordlistLanguage
} from './wordlistValidation'

// Import the new address validation functions
import { validateAndSanitizeAddress } from './validateAddress'
import { bitcoinjsNetwork } from '@/src/config/env'

// Create a backward-compatible validateAddress function
export const validateAddress = (address: string) => {
  const result = validateAndSanitizeAddress(address, bitcoinjsNetwork)
  return {
    isValid : result.isValid,
    error   : result.error
  }
}

// Import and re-export from other files
export * from './clipboardValidation'
export * from './receiveValidation'
export * from './validateAddress'

// Re-export from seedPhraseValidation
export {
  validateSeedPhrase,
  validateSeedPhraseWithDetails,
  normalizeSeedPhrase,
  isValidBip39Word,
  seedPhraseSchema,
  VALID_SEED_PHRASE_LENGTHS,
  getSeedPhraseSuggestion
}

// Re-export from wordlistValidation
export {
  WordlistLanguage,
  getWordlist,
  isWordInWordlist,
  getWordlistSuggestion,
  getWordSuggestions,
  getWordsByPrefix,
  detectWordlistLanguage
} 