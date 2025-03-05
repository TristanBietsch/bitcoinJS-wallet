import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ThemedText type="title">History Screen</ThemedText>
        <ThemedText type="default">
          Your transaction history will be displayed here.
        </ThemedText>
        <ThemedText type="default" style={styles.content}>
          A list of all your Bitcoin transactions.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingBottom: 100,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    marginTop: 10,
    textAlign: 'center',
  },
}); 