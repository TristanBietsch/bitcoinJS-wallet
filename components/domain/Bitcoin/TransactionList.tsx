/**
 * Bitcoin Transaction List Component
 * Displays a list of Bitcoin transactions
 */

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Box, Text, Divider, Icon, HStack, VStack } from '@gluestack-ui/themed';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { useBitcoinWallet } from '../../../hooks/bitcoin/useBitcoinWallet';

// Utility function to format satoshis to BTC
const formatBTC = (sats: number): string => {
  return (sats / 100000000).toFixed(8);
};

// Utility function to format date
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

interface TransactionItemProps {
  txid: string;
  sent: number;
  received: number;
  fee: number;
  confirmations: number;
  timestamp: number;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  txid,
  sent,
  received,
  fee,
  confirmations,
  timestamp,
}) => {
  // Determine if this is an incoming or outgoing transaction
  const isOutgoing = sent > received;
  const amount = isOutgoing ? sent - received - fee : received;
  
  return (
    <Box style={styles.transactionItem}>
      <HStack space="md" alignItems="center">
        <Box
          style={[
            styles.iconContainer,
            isOutgoing ? styles.outgoingIcon : styles.incomingIcon,
          ]}
        >
          {isOutgoing ? (
            <ArrowUpRight size={20} color="white" />
          ) : (
            <ArrowDownLeft size={20} color="white" />
          )}
        </Box>
        
        <VStack flex={1}>
          <Text style={styles.transactionType}>
            {isOutgoing ? 'Sent Bitcoin' : 'Received Bitcoin'}
          </Text>
          <Text style={styles.date}>{formatDate(timestamp)}</Text>
        </VStack>
        
        <VStack alignItems="flex-end">
          <Text
            style={[
              styles.amount,
              isOutgoing ? styles.outgoingText : styles.incomingText,
            ]}
          >
            {isOutgoing ? '-' : '+'}{formatBTC(amount)} BTC
          </Text>
          <HStack alignItems="center" space="xs">
            <Clock size={12} color="#666" />
            <Text style={styles.confirmations}>
              {confirmations > 0 ? `${confirmations} confirmations` : 'Pending'}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};

const TransactionList: React.FC = () => {
  const { transactions, isLoading, error, refreshWallet } = useBitcoinWallet();

  if (isLoading && transactions.length === 0) {
    return (
      <Box style={styles.container}>
        <Text style={styles.centered}>Loading transactions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box style={styles.container}>
        <Text style={styles.centered}>No transactions found</Text>
      </Box>
    );
  }

  return (
    <Box style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.txid}
        renderItem={({ item }) => <TransactionItem {...item} />}
        ItemSeparatorComponent={() => <Divider my="$1" />}
        onRefresh={refreshWallet}
        refreshing={isLoading}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  transactionItem: {
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingIcon: {
    backgroundColor: '#0aa356',
  },
  outgoingIcon: {
    backgroundColor: '#e75a5c',
  },
  transactionType: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  incomingText: {
    color: '#0aa356',
  },
  outgoingText: {
    color: '#e75a5c',
  },
  confirmations: {
    color: '#666',
    fontSize: 12,
  },
  centered: {
    textAlign: 'center',
    padding: 20,
  },
  error: {
    textAlign: 'center',
    padding: 20,
    color: 'red',
  },
});

export default TransactionList; 