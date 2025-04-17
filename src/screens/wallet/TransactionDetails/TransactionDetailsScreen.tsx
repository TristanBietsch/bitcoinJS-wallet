/**
 * Transaction details screen
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTransactionDetails } from '@/src/hooks/transaction'
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
 */
export default function TransactionDetailsScreen() {
  const { id, navigateBack } = useTransactionDetailsNavigation()
  const { transaction, loading, error } = useTransactionDetails(id)

  if (loading) {
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
      <View style={styles.container}>
        <BackButton 
          onPress={navigateBack} 
          accessibilityLabel={TransactionConstants.accessibility.backButton}
        />
        <TransactionDetails transaction={transaction} />
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex  : 1,
    width : '100%',
  }
}) 