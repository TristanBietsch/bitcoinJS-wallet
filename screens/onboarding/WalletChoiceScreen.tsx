import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface WalletChoiceScreenProps {
  onCreateWallet: () => void;
  onImportWallet: () => void;
}

export default function WalletChoiceScreen({ onCreateWallet, onImportWallet }: WalletChoiceScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Set Up Your Wallet
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        Choose how you want to start with Nummus
      </ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={onCreateWallet}
        >
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Create New Wallet
          </ThemedText>
          <ThemedText type="default" style={styles.buttonSubtext}>
            Start fresh with a new Bitcoin wallet
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={onImportWallet}
        >
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Import Existing Wallet
          </ThemedText>
          <ThemedText type="default" style={styles.buttonSubtext}>
            Restore your wallet using seed phrase
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    fontSize: 18,
    marginBottom: 4,
  },
  buttonSubtext: {
    opacity: 0.7,
  },
}); 