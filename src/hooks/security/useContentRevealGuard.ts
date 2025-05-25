import { useState, useCallback } from 'react'

interface ContentRevealGuardReturn {
  isRevealed: boolean
  hasBeenRevealed: boolean
  toggleVisibility: () => void
  canProceed: boolean
  resetVisibility: () => void
}

/**
 * Hook to manage the reveal state of sensitive content with verification
 * that ensures content has been viewed at least once before proceeding
 * 
 * @param onReveal Optional callback when content is first revealed
 * @param onToggle Optional callback when visibility is toggled
 * @returns State and handlers for content visibility
 */
export const useContentRevealGuard = (
  onReveal?: () => void,
  onToggle?: (isRevealed: boolean) => void
): ContentRevealGuardReturn => {
  const [ isRevealed, setIsRevealed ] = useState(false)
  const [ hasBeenRevealed, setHasBeenRevealed ] = useState(false)
  
  const toggleVisibility = useCallback(() => {
    const newState = !isRevealed
    setIsRevealed(newState)
    
    // Track that content has been revealed at least once
    if (newState && !hasBeenRevealed) {
      setHasBeenRevealed(true)
      // Call onReveal callback if provided (first time only)
      if (onReveal) {
        onReveal()
      }
    }
    
    // Call onToggle callback if provided (every toggle)
    if (onToggle) {
      onToggle(newState)
    }
  }, [ isRevealed, hasBeenRevealed, onReveal, onToggle ])
  
  const resetVisibility = useCallback(() => {
    setIsRevealed(false)
    setHasBeenRevealed(false)
  }, [])
  
  return {
    isRevealed,
    hasBeenRevealed,
    toggleVisibility,
    canProceed : hasBeenRevealed,
    resetVisibility
  }
} 