import { useCallback } from 'react'
import { useClipboard } from '@/src/hooks/ui/useClipboard'
import { shareContent } from '@/src/utils/file/fileSharing'

interface ShareActionsResult {
  handleCopy: () => void
  handleShare: () => void
  isCopied: boolean
}

interface AmountInfo {
  sats: string
  usd: string
}

/**
 * Hook to handle share and copy actions for invoice data
 * @param address - The Bitcoin address to share/copy
 * @param amounts - The amount information for the invoice
 * @param title - Optional title for the share dialog
 */
export const useShareActions = (
  address: string,
  amounts: AmountInfo,
  title: string = 'Bitcoin Invoice'
): ShareActionsResult => {
  const { copied, copyToClipboard } = useClipboard()
  
  // Handle copying address to clipboard
  const handleCopy = useCallback(() => {
    copyToClipboard(address)
  }, [ address, copyToClipboard ])
  
  // Handle sharing invoice details
  const handleShare = useCallback(() => {
    const shareMessage = `Bitcoin Payment Request
Amount: ${amounts.sats} SATS (≈$${amounts.usd} USD)
Address: ${address}`
    
    shareContent(shareMessage, title)
  }, [ address, amounts.sats, amounts.usd, title ])
  
  return {
    handleCopy,
    handleShare,
    isCopied : copied
  }
} 