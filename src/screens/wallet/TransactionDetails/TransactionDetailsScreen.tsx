/**
 * Transaction details screen
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTransactionDetails } from '@/src/hooks/transaction/useTransactionHistory'
import { useTransactionDetailsNavigation } from '@/src/hooks/transaction/useTransactionDetailsNavigation'
import { 
  TransactionDetails,
  TransactionDetailsLoading,
  TransactionDetailsError 
} from '@/src/components/features/Transaction/Details'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { Colors } from '@/src/constants/colors'
import { TransactionConstants } from '@/src/constants/transaction'

/**
 * Screen that displays detailed transaction information
 * Now uses real blockchain transaction data from our unified system
 */
export default function TransactionDetailsScreen() {
  const { id, navigateBack } = useTransactionDetailsNavigation()
  const { transaction, isLoading, error } = useTransactionDetails(id)

  if (isLoading) {
    return <TransactionDetailsLoading onBackPress={navigateBack} />
  }

  if (error || !transaction) {
    const errorObject = error instanceof Error 
      ? error 
      : new Error(error ? String(error) : 'Transaction not found')
    
    return <TransactionDetailsError 
      onBackPress={navigateBack} 
      error={errorObject}
    />
  }

  return (
    <SafeAreaContainer backgroundColor={Colors.light.background}>
      <BackButton 
        onPress={navigateBack} 
        accessibilityLabel={TransactionConstants.accessibility.backButton}
      />
      <View style={styles.content}>
        <TransactionDetails transaction={transaction} />
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex      : 1,
    width     : '100%',
    marginTop : 30,
  }
}) 