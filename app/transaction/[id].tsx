import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Mock data - this will be replaced with real data later
const mockTransaction = {
  id: '1',
  amount: '100.00',
  type: 'SEND',
  date: '2024-03-10',
  status: 'COMPLETED',
  recipient: '0x1234...5678',
  description: 'Test transaction',
};

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // This will be replaced with real data fetching logic
  const transaction = mockTransaction;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Transaction {id}</ThemedText>
      <ThemedView style={styles.detailsContainer}>
        <ThemedText>Amount: {transaction.amount}</ThemedText>
        <ThemedText>Type: {transaction.type}</ThemedText>
        <ThemedText>Date: {transaction.date}</ThemedText>
        <ThemedText>Status: {transaction.status}</ThemedText>
        <ThemedText>Recipient: {transaction.recipient}</ThemedText>
        <ThemedText>Description: {transaction.description}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  detailsContainer: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
}); 