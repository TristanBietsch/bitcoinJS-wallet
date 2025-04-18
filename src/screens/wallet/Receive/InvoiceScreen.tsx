import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'

// Import modularized components
import InvoiceScreenLayout from '@/src/components/layout/InvoiceScreenLayout'
import InvoiceContent from '@/src/components/features/Receive/InvoiceContent'

// Import custom hooks
import { useAddressGeneration } from '@/src/hooks/receive/useAddressGeneration'
import { useInvoiceAmount } from '@/src/hooks/receive/useInvoiceAmount'
import { useShareActions } from '@/src/hooks/receive/useShareActions'

export default function InvoiceScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ amount: string; currency: string }>()
  
  // Use our modular hooks
  const { address, isLoading } = useAddressGeneration()
  const { satsAmount, usdAmount } = useInvoiceAmount(params.amount, params.currency)
  const { handleCopy, handleShare } = useShareActions(address, { sats: satsAmount, usd: usdAmount })
  
  // Handle back navigation
  const handleBackPress = () => {
    router.back()
  }
  
  return (
    <InvoiceScreenLayout onBackPress={handleBackPress}>
      <InvoiceContent
        address={address}
        satsAmount={satsAmount}
        usdAmount={usdAmount}
        onCopy={handleCopy}
        onShare={handleShare}
        isLoading={isLoading}
      />
    </InvoiceScreenLayout>
  )
} 