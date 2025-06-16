import React from 'react'
import { ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl } from 'react-native'
import { ActivityHeader } from '@/src/components/ui/Header/ActivityHeader'
import { TransactionGroups } from '@/src/components/features/Transaction/List/TransactionGroups'
import { useTransactionNavigation } from '@/src/components/ui/Navigation/transactionNavigation'
import { useGroupedTransactions } from '@/src/hooks/transaction/useGroupedTransactions'
import { useTransactions } from '@/src/hooks/transaction/useTransactionHistory'
import { useAutoWalletSync } from '@/src/hooks/wallet/useAutoWalletSync'
import { ThemedText } from '@/src/components/ui/Text'

export default function ActivityScreen() {
  const { navigateToTransactionDetails } = useTransactionNavigation()
  
  // Auto-sync wallet data to ensure transactions are up to date
  useAutoWalletSync()
  
  // Fetch real transaction history using the unified hook
  const {
    transactions,
    isLoading,
    isError,
    error,
    refresh,
    isRefreshing
  } = useTransactions({
    limit: 100 // Fetch more transactions for better grouping
  })
  
  // Group transactions by time periods using existing hook
  // Note: Using transactions directly - grouping hook may need updates for real transaction data
  const groupedTransactions = useGroupedTransactions(transactions)
  
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
        </View>
      </View>
    )
  }
  
  // Error state
  if (isError) {
    return (
      <View style={styles.container}>
        <ActivityHeader />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorTitle}>⚠️ Failed to load transactions</ThemedText>
          <ThemedText style={styles.errorMessage}>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </ThemedText>
          <ThemedText 
            style={styles.retryText}
            onPress={() => refresh()}
          >
            Tap to retry
          </ThemedText>
        </View>
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <ActivityHeader />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#007AFF"
          />
        }
      >
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyTitle}>No transactions yet</ThemedText>
            <ThemedText style={styles.emptyMessage}>
              Your transaction history will appear here once you send or receive Bitcoin.
            </ThemedText>
          </View>
        ) : (
          <TransactionGroups 
            groupedTransactions={groupedTransactions}
            onPressTransaction={navigateToTransactionDetails}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
}) 