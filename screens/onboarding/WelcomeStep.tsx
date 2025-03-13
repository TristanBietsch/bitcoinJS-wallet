import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Nummus Wallet</Text>
      <Text style={styles.description}>
        Your secure Bitcoin wallet for everyday transactions
      </Text>
    </View>
  );
}

export const welcomeStepConfig = {
  id: 'welcome',
  Component: WelcomeStep,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
}); 