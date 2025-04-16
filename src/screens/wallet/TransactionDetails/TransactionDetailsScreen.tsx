/**
 * Transaction details screen
 */
import React from 'react'
import { useTransactionDetails } from '@/src/hooks/transaction'
import { useTransactionDetailsNavigation } from '@/src/hooks/transaction/useTransactionDetailsNavigation'
import TransactionContent from '@/src/components/features/Transaction/TransactionContent'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { Colors } from '@/src/constants/colors'

/**
 * Screen that displays detailed transaction information
 */
export default function TransactionDetailsScreen() {
  const { id, navigateBack } = useTransactionDetailsNavigation()
  const { transaction, loading, error } = useTransactionDetails(id)

  return (
    <SafeAreaContainer backgroundColor={Colors.light.background}>
      <TransactionContent
        transaction={transaction}
        loading={loading}
        error={error}
        onBackPress={navigateBack}
      />
    </SafeAreaContainer>
  )
} 