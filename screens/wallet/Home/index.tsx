import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ThemedText type="title">Home Screen</ThemedText>
        <ThemedText type="default">
          This is your wallet home screen.
        </ThemedText>
        <ThemedText type="default" style={styles.content}>
          Here you'll see your balance and recent transactions.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
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