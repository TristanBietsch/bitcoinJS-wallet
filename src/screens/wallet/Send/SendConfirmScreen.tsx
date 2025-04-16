import React from 'react'
import { Stack } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import TransactionSummaryFooter from '@/src/components/features/Send/Confirmation/TransactionSummaryFooter'
import { useSendNavigation } from '@/src/components/ui/Navigation/sendNavigation'
import { useTransactionParams } from '@/src/hooks/send/useTransactionParams'
import { transactionStyles } from '@/src/constants/transactionStyles'

/**
 * Screen for confirming transaction details before sending
 */
export default function SendConfirmScreen() {
  const { navigateBack, navigateToSendLoading } = useSendNavigation()
  const { 
    amount, 
    address, 
    fee, 
    currency, 
    totalAmount 
  } = useTransactionParams()
  
  return (
    <SafeAreaContainer style={transactionStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <BackButton onPress={navigateBack} />
      
      {/* Transaction Summary with Send Button */}
      <TransactionSummaryFooter
        amount={amount}
        address={address}
        fee={fee}
        currency={currency}
        totalAmount={totalAmount}
        onSendPress={navigateToSendLoading}
      />
    </SafeAreaContainer>
  )
} 