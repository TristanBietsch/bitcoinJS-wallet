/**
 * Container component for transaction details content
 */
import React from 'react'
import { ViewStyle } from 'react-native'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { TransactionConstants } from '@/src/constants/transaction'
import { 
  TransactionDetails,
  TransactionDetailsLoading,
  TransactionDetailsError
} from '@/src/components/features/Transaction/Details'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'

interface TransactionContentProps {
  transaction?: any // Using any to match existing component interface
  loading: boolean
  error?: Error | string | null
  onBackPress: () => void
  style?: ViewStyle
}

/**
 * Container component that handles different transaction detail states
 */
const TransactionContent: React.FC<TransactionContentProps> = ({
  transaction,
  loading,
  error,
  onBackPress,
  style
}) => {
  if (loading) {
    return <TransactionDetailsLoading onBackPress={onBackPress} />
  }

  if (error || !transaction) {
    // Convert any error to an Error object
    let errorObject: Error | null = null
    
    if (error) {
      errorObject = error instanceof Error 
        ? error 
        : new Error(String(error))
    } else if (!transaction) {
      errorObject = new Error('Transaction not found')
    }
      
    return <TransactionDetailsError 
      onBackPress={onBackPress} 
      error={errorObject}
    />
  }

  return (
    <StatusScreenLayout 
      style={style}
      hideHeader={true}
    >
      <BackButton 
        onPress={onBackPress} 
        accessibilityLabel={TransactionConstants.accessibility.backButton}
      />
      <TransactionDetails transaction={transaction} />
    </StatusScreenLayout>
  )
}

export default TransactionContent 