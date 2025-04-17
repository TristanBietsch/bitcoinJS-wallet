import React from 'react'
import { View, StyleSheet } from 'react-native'
import { TransactionConfirmationDetails } from '@/src/components/features/Send/Confirmation/TransactionConfirmationDetails'
import { SendButton } from '@/src/components/ui/Button/SendButton'
import { CurrencyType } from '@/src/types/currency.types'
import { useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface TransactionSummaryFooterProps {
  amount: number
  address: string
  fee: any // Using 'any' temporarily to match the TransactionConfirmationDetails interface
  currency: CurrencyType
  totalAmount: number
  totalAmountUsd?: number
  onSendPress: () => void
}

/**
 * A component that combines transaction details and send button
 */
const TransactionSummaryFooter: React.FC<TransactionSummaryFooterProps> = ({
  amount,
  address,
  fee,
  currency,
  totalAmount,
  totalAmountUsd,
  onSendPress
}) => {
  const router = useRouter()
  
  // Function to directly navigate to error screen (for testing)
  const navigateToErrorScreen = () => {
    router.replace('/send/error' as any)
  }
  
  return (
    <View style={styles.container}>
      {/* Transaction Details */}
      <TransactionConfirmationDetails 
        amount={amount}
        address={address}
        fee={fee}
        currency={currency}
        totalAmount={totalAmount}
        totalAmountUsd={totalAmountUsd}
      />
      
      {/* Test Error Button */}
      <TouchableOpacity style={styles.errorButton} onPress={navigateToErrorScreen}>
        <ThemedText style={styles.errorButtonText}>Trigger Send Error</ThemedText>
      </TouchableOpacity>
      
      {/* Send Button */}
      <SendButton onPress={onSendPress} />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex           : 1,
    justifyContent : 'space-between',
    paddingBottom  : 20
  },
  errorButton : {
    height           : 46,
    backgroundColor  : '#FF5722',
    borderRadius     : 23,
    alignItems       : 'center',
    justifyContent   : 'center',
    marginHorizontal : 20,
    marginBottom     : 10
  },
  errorButtonText : {
    color      : '#FFF',
    fontSize   : 14,
    fontWeight : '600'
  }
})

export default TransactionSummaryFooter 