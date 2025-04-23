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

// Import and re-export from other files
export * from './clipboardValidation'
export * from './receiveValidation'
export * from './validateAddress'
export * from './validateInvoice'
export * from './validateInput'

// Export renamed and specific functions
export {
  // From seedPhraseValidation
  validateSeedPhrase,
  validateSeedPhraseWithDetails,
  normalizeSeedPhrase,
  isValidBip39Word,
  seedPhraseSchema,
  VALID_SEED_PHRASE_LENGTHS,
  getSeedPhraseSuggestion,
  
  // From wordlistValidation
  WordlistLanguage,
  getWordlist,
  isWordInWordlist,
  getWordlistSuggestion,
  getWordSuggestions,
  getWordsByPrefix,
  detectWordlistLanguage
} 