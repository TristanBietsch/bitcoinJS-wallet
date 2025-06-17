import { useState, useEffect } from 'react'
import { validateSeedPhraseWithDetails } from '@/src/utils/validation/seedPhraseValidation'
import { validationMessages } from '@/src/constants/validationMessages'
import { normalizeMnemonic } from '@/src/constants/validationMessages'
import { isWordInWordlist, getWordlistSuggestion } from '@/src/utils/validation'
import { Animated } from 'react-native'

export interface WordValidation {
  word: string
  isValid: boolean
  suggestion?: string
}

export interface ValidationResult {
  isValid: boolean
  errorMessage: string
  wordCount: number
}

/**
 * Custom hook to handle seed phrase validation
 */
export const useSeedPhraseValidation = (seedPhrase: string) => {
  const [ validationResult, setValidationResult ] = useState<ValidationResult>({
    isValid      : false,
    errorMessage : '',
    wordCount    : 0
  })
  
  const [ wordValidations, setWordValidations ] = useState<WordValidation[]>([])
  const [ showValidation, setShowValidation ] = useState(false)
  const [ successAnim ] = useState(new Animated.Value(0))
  
  // Word-by-word validation
  useEffect(() => {
    if (!seedPhrase.trim()) {
      setWordValidations([])
      return
    }
    
    const normalizedPhrase = normalizeMnemonic(seedPhrase)
    const words = normalizedPhrase.split(' ').filter(Boolean)
    
    const validations = words.map(word => {
      const isValid = isWordInWordlist(word)
      const suggestion = isValid ? undefined : getWordlistSuggestion(word)
      
      return {
        word,
        isValid,
        suggestion
      }
    })
    
    setWordValidations(validations)
  }, [ seedPhrase ])

  // Full seed phrase validation
  useEffect(() => {
    if (!seedPhrase.trim()) {
      setValidationResult({
        isValid      : false,
        errorMessage : validationMessages.seedPhrase.empty,
        wordCount    : 0
      })
      return
    }

    const normalizedPhrase = normalizeMnemonic(seedPhrase)
    const words = normalizedPhrase.split(' ').filter(Boolean)
    const wordCount = words.length
    
    // Only perform full validation if we have enough words
    if (wordCount >= 3) {
      const result = validateSeedPhraseWithDetails(normalizedPhrase)
      setValidationResult({
        isValid      : result.isValid,
        errorMessage : result.errorMessage,
        wordCount
      })
      
      // Animate success state when valid
      if (result.isValid) {
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue         : 1,
            duration        : 300,
            useNativeDriver : true
          }),
          Animated.timing(successAnim, {
            toValue         : 0.8,
            duration        : 200,
            useNativeDriver : true
          }),
          Animated.timing(successAnim, {
            toValue         : 1,
            duration        : 200,
            useNativeDriver : true
          })
        ]).start()
      }
    } else {
      // For partial input, just count words
      setValidationResult({
        isValid      : false,
        errorMessage : validationMessages.seedPhrase.incorrectWordCount(wordCount),
        wordCount    : wordCount
      })
    }
  }, [ seedPhrase, successAnim ])
  
  // Get specific error suggestions if there are invalid words
  const getSuggestionText = () => {
    const invalidWords = wordValidations.filter(v => !v.isValid)
    let suggestionText = ''
    
    if (invalidWords.length === 1 && invalidWords[0].suggestion) {
      suggestionText = `Did you mean "${invalidWords[0].suggestion}" instead of "${invalidWords[0].word}"?`
    } else if (invalidWords.length > 0) {
      suggestionText = 'Check the highlighted words for errors.'
    }
    
    return suggestionText
  }
  
  return {
    validationResult,
    wordValidations,
    showValidation,
    successAnim,
    setShowValidation,
    suggestionText : getSuggestionText()
  }
} 