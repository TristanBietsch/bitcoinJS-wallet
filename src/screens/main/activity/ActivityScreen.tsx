import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ActivityHeader } from '@/src/components/ui/Header/ActivityHeader'
import { TransactionGroups } from '@/src/components/features/Transaction/List/TransactionGroups'
import { mockTransactions } from '@/tests/mockData/transactionData'
import { useTransactionNavigation } from '@/src/components/ui/Navigation/transactionNavigation'
import { useGroupedTransactions } from '@/src/hooks/transaction/useGroupedTransactions'

export default function ActivityScreen() {
  const { navigateToTransactionDetails } = useTransactionNavigation()
  
  // Group transactions by time periods using custom hook
  const groupedTransactions = useGroupedTransactions(mockTransactions)
  
  return (
    <View style={styles.container}>
      <ActivityHeader />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <TransactionGroups 
          groupedTransactions={groupedTransactions}
          onPressTransaction={navigateToTransactionDetails}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#FFFFFF',
  },
  scrollView : {
    flex : 1,
  },
  scrollViewContent : {
    paddingTop : 16,
  },
}) 