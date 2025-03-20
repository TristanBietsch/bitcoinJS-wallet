import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';

interface ImportWalletScreenProps {
  onComplete: () => void;
}

export default function ImportWalletScreen({ onComplete }: ImportWalletScreenProps) {
  const [seedPhrase, setSeedPhrase] = useState('');

  const handleImport = () => {
    // In a real implementation, we would validate the seed phrase here
    onComplete();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Import Wallet
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        Enter your 12-word seed phrase to restore your wallet
      </ThemedText>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Enter your seed phrase, with words separated by spaces"
          value={seedPhrase}
          onChangeText={setSeedPhrase}
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
        />
        <ThemedText type="default" style={styles.hint}>
          Typically 12 words separated by single spaces
        </ThemedText>
      </View>

      <TouchableOpacity 
        style={[styles.button, !seedPhrase && styles.buttonDisabled]} 
        onPress={handleImport}
        disabled={!seedPhrase}
      >
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Import Wallet
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  inputContainer: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 