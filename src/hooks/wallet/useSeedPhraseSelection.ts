import { useState, useEffect, useCallback } from 'react'

export interface SelectedWord {
  word: string
  order: number
}

interface SeedPhraseSelectionReturn {
  selectedWords: SelectedWord[]
  shuffledWords: string[]
  handleWordSelect: (word: string) => void
  getSelectionOrder: (word: string) => number | null
  resetSelection: () => void
  getOrderedSelectedWords: () => string[]
  isSelectionComplete: boolean
}

/**
 * Hook for managing seed phrase word selection during verification
 * @param seedPhrase Original seed phrase to verify against
 * @returns Selection state and handler functions
 */
export const useSeedPhraseSelection = (
  seedPhrase: string[]
): SeedPhraseSelectionReturn => {
  const [ shuffledWords, setShuffledWords ] = useState<string[]>([])
  const [ selectedWords, setSelectedWords ] = useState<SelectedWord[]>([])
  
  // Shuffle words on hook initialization
  useEffect(() => {
    const shuffled = [ ...seedPhrase ].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
  }, [ seedPhrase ])
  
  const handleWordSelect = useCallback((word: string) => {
    // Check if word is already selected
    const isSelected = selectedWords.some(item => item.word === word)
    
    if (isSelected) {
      // Check if this is the most recently selected word (highest order)
      const selectedWord = selectedWords.find(item => item.word === word)
      const isLastSelected = selectedWord && 
        selectedWord.order === Math.max(...selectedWords.map(item => item.order))
      
      // Only allow deselection of the most recently selected word
      if (isLastSelected) {
        // Remove the most recently selected word
        setSelectedWords(selectedWords.filter(item => item.word !== word))
      }
      return
    }
    
    if (selectedWords.length < seedPhrase.length) {
      // Add word with current selection order
      const newSelection: SelectedWord = {
        word  : word,
        order : selectedWords.length + 1
      }
      
      setSelectedWords([ ...selectedWords, newSelection ])
    }
  }, [ selectedWords, seedPhrase.length ])
  
  const getSelectionOrder = useCallback((word: string): number | null => {
    const selected = selectedWords.find(item => item.word === word)
    return selected ? selected.order : null
  }, [ selectedWords ])
  
  const resetSelection = useCallback(() => {
    setSelectedWords([])
  }, [])
  
  // Extract words in the order they were selected
  const getOrderedSelectedWords = useCallback((): string[] => {
    return selectedWords
      .sort((a, b) => a.order - b.order)
      .map(item => item.word)
  }, [ selectedWords ])
  
  const isSelectionComplete = selectedWords.length === seedPhrase.length
  
  return {
    selectedWords,
    shuffledWords,
    handleWordSelect,
    getSelectionOrder,
    resetSelection,
    getOrderedSelectedWords,
    isSelectionComplete
  }
} 