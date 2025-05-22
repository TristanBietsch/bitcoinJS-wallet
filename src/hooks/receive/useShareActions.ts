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
    if (address) {
      copyToClipboard(address)
    }
  }, [ address, copyToClipboard ])
  
  // Handle sharing invoice details
  const handleShare = useCallback(async () => {
    try {
      // Don't share if we don't have an address yet
      if (!address || address.trim() === '') {
        console.log('Cannot share: address not available yet')
        return
      }

      const satsAmount = amounts.sats || '0'
      const amountInBTC = parseFloat(satsAmount) / 100000000
      
      // Create a bitcoin URI for easy payment
      const bitcoinURI = amountInBTC > 0 
        ? `bitcoin:${address}?amount=${amountInBTC.toFixed(8)}`
        : `bitcoin:${address}`

      const message = `Bitcoin Payment Request

Address: ${address}
Amount: ${satsAmount} sats (${amountInBTC.toFixed(8)} BTC)

Bitcoin URI: ${bitcoinURI}

You can copy this URI to make a payment using any Bitcoin wallet.`

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