import { useCallback } from 'react'
import { useClipboard } from '@/src/hooks/ui/useClipboard'
import { Share } from 'react-native'

interface ShareAmounts {
  sats: string
}

interface UseShareActionsProps {
  address: string
  amounts: ShareAmounts
  title?: string
}

interface ShareActionsResult {
  handleCopy: () => void
  handleShare: () => void
  isCopied: boolean
}

/**
 * Hook to handle share and copy actions for invoice data
 * @param address - The Bitcoin address to share/copy
 * @param amounts - The amount information for the invoice
 * @param title - Optional title for the share dialog
 */
export const useShareActions = ({ address, amounts, title = 'Bitcoin Invoice' }: UseShareActionsProps): ShareActionsResult => {
  const { copied, copyToClipboard } = useClipboard()
  
  // Handle copying address to clipboard
  const handleCopy = useCallback(() => {
    copyToClipboard(address)
  }, [ address, copyToClipboard ])
  
  // Handle sharing invoice details
  const handleShare = useCallback(async () => {
    try {
      const message = `Bitcoin Invoice:
Address: ${address}
Amount: ${amounts.sats} SATS`

      await Share.share({
        message,
        title,
      })
    } catch (error) {
      console.error('Error sharing invoice:', error)
      // Handle error (e.g., show a toast notification)
    }
  }, [ address, amounts.sats, title ])
  
  return {
    handleCopy,
    handleShare,
    isCopied : copied
  }
} 