import React from 'react'
import { View, StyleSheet } from 'react-native'
import { TransactionConfirmationDetails } from '@/src/components/features/Send/Confirmation/TransactionConfirmationDetails'
import { SendButton } from '@/src/components/ui/Button/SendButton'
import { CurrencyType } from '@/src/types/domain/finance'
import { TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { useSendStore } from '@/src/store/sendStore'
import { Colors } from '@/src/constants/colors'

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
  const { setErrorMode } = useSendStore()
  
  // Setup handlers for each button
  
  // Normal send flow
  const handleNormalSend = () => {
    setErrorMode('none')
    onSendPress()
  }
  
  // Trigger validation error
  const triggerValidationError = () => {
    setErrorMode('validation')
    onSendPress()
  }
  
  // Trigger network error
  const triggerNetworkError = () => {
    setErrorMode('network')
    onSendPress()
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
      
      {/* Test Error Buttons */}
      <View style={styles.errorButtonsContainer}>
        <TouchableOpacity 
          style={[ styles.errorButton, styles.validationErrorButton ]} 
          onPress={triggerValidationError}
        >
          <ThemedText style={styles.errorButtonText}>Validation Error</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[ styles.errorButton, styles.networkErrorButton ]} 
          onPress={triggerNetworkError}
        >
          <ThemedText style={styles.errorButtonText}>Network Error</ThemedText>
        </TouchableOpacity>
      </View>
      
      {/* Send Button */}
      <SendButton onPress={handleNormalSend} />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex           : 1,
    justifyContent : 'space-between',
    paddingBottom  : 20
  },
  errorButtonsContainer : {
    flexDirection    : 'row',
    justifyContent   : 'space-between',
    marginHorizontal : 20,
    marginBottom     : 10
  },
  errorButton : {
    height         : 46,
    flex           : 1,
    borderRadius   : 23,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  validationErrorButton : {
    backgroundColor : Colors.light.buttons.warning,
    marginRight     : 10
  },
  networkErrorButton : {
    backgroundColor : Colors.light.buttons.danger
  },
  errorButtonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 14,
    fontWeight : '600'
  }
})

export default TransactionSummaryFooter 