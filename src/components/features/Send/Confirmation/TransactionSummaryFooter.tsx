import React from 'react'
import { View, StyleSheet } from 'react-native'
import { TransactionConfirmationDetails } from '@/src/components/features/Send/Confirmation/TransactionConfirmationDetails'
import { SendButton } from '@/src/components/ui/Button/SendButton'
import { CurrencyType } from '@/src/types/currency.types'

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
  }
})

export default TransactionSummaryFooter 