import React from 'react'
import { View, StyleSheet } from 'react-native'
import { TransactionConfirmationDetails } from '@/src/components/features/Send/Confirmation/TransactionConfirmationDetails'
import { SendButton } from '@/src/components/ui/Button/SendButton'
import { CurrencyType } from '@/src/types/domain/finance'
import { TransactionFee } from '@/src/utils/transaction/feeCalculator'

interface TransactionSummaryFooterProps {
  amount: number
  address: string
  feeSats: number
  feeRate: number
  currency: CurrencyType
  totalAmount: number
  onSendPress: () => void
}

/**
 * A component that combines transaction details and send button
 */
const TransactionSummaryFooter: React.FC<TransactionSummaryFooterProps> = ({
  amount,
  address,
  feeSats,
  feeRate,
  currency,
  totalAmount,
  onSendPress
}) => {
  // Construct the fee object for TransactionConfirmationDetails
  const transactionFeeForDetails: TransactionFee = {
    sats    : feeSats,
    feeRate : feeRate,
  }
  
  return (
    <View style={styles.container}>
      {/* Transaction Details */}
      <TransactionConfirmationDetails 
        amount={amount}
        address={address}
        fee={transactionFeeForDetails}
        currency={currency}
        totalAmount={totalAmount}
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