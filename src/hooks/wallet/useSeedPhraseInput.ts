import { useState, useCallback } from 'react'
import { normalizeMnemonic } from '@/src/constants/validationMessages'

/**
 * Custom hook to handle seed phrase input and text processing
 */
export const useSeedPhraseInput = () => {
  const [ seedPhrase, setSeedPhrase ] = useState('')
  
  const handleSeedPhraseChange = useCallback((text: string) => {
    // Prevent entering more than 24 words
    const normalizedText = normalizeMnemonic(text)
    const words = normalizedText.split(' ').filter(Boolean)
    
    if (words.length > 24) {
      // Limit to first 24 words
      const limitedWords = words.slice(0, 24)
      const limitedText = limitedWords.join(' ')
      setSeedPhrase(limitedText)
      return limitedText
    }
    
    setSeedPhrase(text)
    return text
  }, [])
  
  const clearSeedPhrase = useCallback(() => {
    setSeedPhrase('')
  }, [])
  
  return {
    seedPhrase,
    handleSeedPhraseChange,
    clearSeedPhrase
  }
} 