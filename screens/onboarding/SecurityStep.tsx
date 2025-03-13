import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SecurityStepProps {
  onNext: () => void;
}

export default function SecurityStep({ onNext }: SecurityStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safe & Secure</Text>
      <Text style={styles.description}>
        Your keys, your coins. We never store your private keys
      </Text>
    </View>
  );
}

export const securityStepConfig = {
  id: 'security',
  Component: SecurityStep,
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