import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'

// Import modularized components
import InvoiceScreenLayout from '@/src/components/layout/InvoiceScreenLayout'
import InvoiceContent from '@/src/components/features/Receive/InvoiceContent'

// Import custom hooks
import { useAddressGeneration } from '@/src/hooks/receive/useAddressGeneration'
import { useInvoiceAmount } from '@/src/hooks/receive/useInvoiceAmount'
import { useShareActions } from '@/src/hooks/receive/useShareActions'
import { CurrencyType } from '@/src/types/domain/finance'

export default function InvoiceScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ amount: string; currency: string }>()
  
  // Use our modular hooks
  const { address, isLoading } = useAddressGeneration()
  const { satsAmount, formattedAmount } = useInvoiceAmount(
    params.amount,
    params.currency as CurrencyType
  )
  const { handleCopy, handleShare } = useShareActions({
    address,
    amounts : { sats: satsAmount }
  })
  
  // Handle back navigation
  const handleBackPress = () => {
    router.back()
  }
  
  return (
    <InvoiceScreenLayout onBackPress={handleBackPress}>
      <InvoiceContent
        address={address}
        satsAmount={satsAmount}
        formattedAmount={formattedAmount}
        onCopy={handleCopy}
        onShare={handleShare}
        isLoading={isLoading}
      />
    </InvoiceScreenLayout>
  )
} 