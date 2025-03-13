import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UsageStepProps {
  onNext: () => void;
}

export default function UsageStep({ onNext }: UsageStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Easy to Use</Text>
      <Text style={styles.description}>
        Send and receive Bitcoin with just a few taps
      </Text>
    </View>
  );
}

export const usageStepConfig = {
  id: 'usage',
  Component: UsageStep,
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