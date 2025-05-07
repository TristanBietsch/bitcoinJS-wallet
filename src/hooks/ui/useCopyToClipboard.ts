import { useState, useCallback } from 'react'
import * as Clipboard from 'expo-clipboard'

export type CopyStatus = 'copy' | 'copied'

interface CopyToClipboardResult {
  copyStatus: CopyStatus
  copyToClipboard: (text: string) => Promise<void>
}

/**
 * Hook to handle clipboard copy operations with status feedback
 * @param resetDelay - Time in ms to show 'copied' status before resetting to 'copy' (default: 2000ms)
 */
export const useCopyToClipboard = (resetDelay = 2000): CopyToClipboardResult => {
  const [ copyStatus, setCopyStatus ] = useState<CopyStatus>('copy')
  
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text)
      setCopyStatus('copied')
      
      // Reset the copy status after specified delay
      setTimeout(() => {
        setCopyStatus('copy')
      }, resetDelay)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      setCopyStatus('copy')
    }
  }, [ resetDelay ])
  
  return {
    copyStatus,
    copyToClipboard
  }
} 