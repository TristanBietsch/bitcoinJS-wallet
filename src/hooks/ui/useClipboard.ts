import { useState, useCallback } from 'react'
import * as Clipboard from 'expo-clipboard'

/**
 * Hook for clipboard operations with copied state feedback
 * @param resetDelay Delay in ms before resetting the copied state (default: 3000ms)
 */
export const useClipboard = (resetDelay = 3000) => {
  const [ copied, setCopied ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)

  /**
   * Copy text to clipboard
   * @param text Text to copy
   */
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text)
      setCopied(true)
      setError(null)
      
      // Reset copied state after delay
      setTimeout(() => {
        setCopied(false)
      }, resetDelay)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      setError('Failed to copy to clipboard')
      setCopied(false)
    }
  }, [ resetDelay ])

  return {
    copied,
    error,
    copyToClipboard
  }
} 