import React, { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'

// Import modularized components
import InvoiceScreenLayout from '@/src/components/layout/InvoiceScreenLayout'
import RequestAmountCard from '@/src/components/features/Wallet/RequestAmountCard'
import BitcoinQRDisplay from '@/src/components/features/Receive/BitcoinQRDisplay'

// Import hooks and services
import { useConvertBitcoin } from '@/src/hooks/bitcoin/useConvertBitcoin'
import { generateBitcoinAddress } from '@/src/services/bitcoin/addressService'
import { useClipboard } from '@/src/hooks/ui/useClipboard'

export default function InvoiceScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ amount: string; currency: string }>()
  
  // Use the Bitcoin conversion hook
  const { getConvertedAmounts, refreshPrice } = useConvertBitcoin()
  
  // Get the Bitcoin address - in a real app, this would be generated for each invoice
  const [ address, setAddress ] = React.useState<string>('')
  
  // Clipboard functionality
  const { copied, copyToClipboard } = useClipboard()
  
  // Fetch Bitcoin address
  useEffect(() => {
    const fetchAddress = async () => {
      const addr = await generateBitcoinAddress()
      setAddress(addr)
    }
    fetchAddress()
  }, [ ])
  
  // Refresh Bitcoin price when component mounts
  useEffect(() => {
    refreshPrice()
  }, [ refreshPrice ])
  
  // Convert amounts based on parameters
  const amounts = getConvertedAmounts(
    params.amount || '0',
    params.currency || 'BTC'
  )
  
  // Handle back navigation
  const handleBackPress = () => {
    router.back()
  }
  
  // Handle copy to clipboard
  const handleCopy = () => {
    copyToClipboard(address)
  }
  
  // Create share message
  const shareMessage = `Bitcoin Payment Request\nAmount: ${params.amount} ${params.currency}\nAddress: ${address}`
  
  return (
    <InvoiceScreenLayout onBackPress={handleBackPress}>
      {/* Amount Display */}
      <RequestAmountCard
        satsAmount={amounts.sats}
        usdAmount={amounts.usd}
        title="Payment Request"
      />
      
      {/* Bitcoin Address Display with QR and Action Buttons */}
      <BitcoinQRDisplay
        address={address}
        qrSize={180}
        label="bitcoin address:"
        onCopy={handleCopy}
        copied={copied}
        shareMessage={shareMessage}
        shareTitle="Bitcoin Payment Request"
      />
    </InvoiceScreenLayout>
  )
} 