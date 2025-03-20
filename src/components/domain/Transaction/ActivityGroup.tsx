import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ActivityItem } from './ActivityItem';
import { Transaction } from '@/tests/mockData/transactionData';
import { fonts } from '@/src/constants/fonts';

interface ActivityGroupProps {
  title: string;
  transactions: Transaction[];
  onPressTransaction?: (transaction: Transaction) => void;
}

export const ActivityGroup: React.FC<ActivityGroupProps> = ({ 
  title, 
  transactions,
  onPressTransaction 
}) => {
  if (transactions.length === 0) return null;
  
  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      
      <View style={styles.transactionsContainer}>
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <ActivityItem 
              transaction={transaction} 
              onPress={onPressTransaction ? () => onPressTransaction(transaction) : undefined}
            />
            {/* Add a divider line between transactions, except after the last one */}
            {index < transactions.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 68, // Align with the content, not the icon
    marginRight: 16,
  },
}); 