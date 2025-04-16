import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { TransactionConfirmationDetails } from '@/src/components/features/Send/Confirmation/TransactionConfirmationDetails'
import { SendButton } from '@/src/components/ui/Button/SendButton'
import { useSendNavigation } from '@/src/components/ui/Navigation/sendNavigation'
import { calculateTransactionFee, getFeeInCurrency } from '@/src/utils/send/feeCalculations'
import { CurrencyType } from '@/src/types/currency.types'
import { transactionStyles } from '@/src/constants/transactionStyles'

export default function SendConfirmScreen() {
  const { address, speed, customFee } = useSendStore()
  const { navigateBack, navigateToSendLoading } = useSendNavigation()
  const params = useLocalSearchParams<{ amount: string; currency: string }>()
  
  // Parse amount and currency
  const amount = parseFloat(params.amount || '0')
  const currency = (params.currency || 'USD') as CurrencyType
  
  // Calculate fee based on selected speed or custom fee
  const fee = calculateTransactionFee(speed, customFee)
  
  // Calculate total (amount + fee) in the correct currency
  const feeInCurrency = getFeeInCurrency(fee, currency)
  const totalAmount = amount + feeInCurrency
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <BackButton onPress={navigateBack} />
      
      {/* Transaction Details */}
      <TransactionConfirmationDetails 
        amount={amount}
        address={address}
        fee={fee}
        currency={currency}
        totalAmount={totalAmount}
      />
      
      {/* Send Button */}
      <SendButton onPress={navigateToSendLoading} />
    </View>
  )
}

const styles = StyleSheet.create({
  ...transactionStyles
}) 