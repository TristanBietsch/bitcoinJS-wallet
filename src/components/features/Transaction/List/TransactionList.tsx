import React from 'react'
import { FlatList, Text, View, StyleSheet } from 'react-native'
import TransactionItem from './TransactionItem'

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  date: Date;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress: (transaction: Transaction) => void;
  emptyMessage?: string;
  loading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  emptyMessage = 'No transactions yet',
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyMessage}>Loading transactions...</Text>
      </View>
    )
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={transactions}
      renderItem={({ item }) => (
        <TransactionItem 
          transaction={item} 
          onPress={() => onTransactionPress(item)} 
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  )
}

const styles = StyleSheet.create({
  listContainer : {
    paddingHorizontal : 16,
    paddingBottom     : 16,
  },
  emptyContainer : {
    flex           : 1,
    padding        : 24,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  emptyMessage : {
    fontSize  : 16,
    color     : COLORS.textSecondary,
    textAlign : 'center',
  },
})

export default TransactionList 