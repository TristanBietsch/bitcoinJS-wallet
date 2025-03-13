import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ConfirmSeedWordsScreenProps {
  onComplete: () => void;
}

// Mock seed phrase for demonstration
const MOCK_SEED_PHRASE = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
];

export default function ConfirmSeedWordsScreen({ onComplete }: ConfirmSeedWordsScreenProps) {
  const [showSeed, setShowSeed] = useState(false);
  const [step, setStep] = useState<'view' | 'verify'>('view');

  const handleContinue = () => {
    if (step === 'view') {
      setStep('verify');
    } else {
      onComplete();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.title}>
          {step === 'view' ? 'Backup Your Wallet' : 'Verify Your Backup'}
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          {step === 'view' 
            ? 'Write down these 12 words in order and store them securely'
            : 'Select the words in the correct order to verify your backup'
          }
        </ThemedText>

        {step === 'view' ? (
          <View style={styles.seedContainer}>
            {!showSeed ? (
              <TouchableOpacity 
                style={styles.revealButton} 
                onPress={() => setShowSeed(true)}
              >
                <ThemedText type="defaultSemiBold" style={styles.revealButtonText}>
                  Tap to Reveal Seed Phrase
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.wordGrid}>
                {MOCK_SEED_PHRASE.map((word, index) => (
                  <View key={index} style={styles.wordContainer}>
                    <ThemedText type="default" style={styles.wordNumber}>
                      {index + 1}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.word}>
                      {word}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.verificationContainer}>
            <ThemedText type="default" style={styles.verificationText}>
              Verification UI would go here
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.button, !showSeed && step === 'view' && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={!showSeed && step === 'view'}
      >
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          {step === 'view' ? "I've Written It Down" : 'Confirm Backup'}
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
  scrollView: {
    flex: 1,
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
  seedContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    minHeight: 200,
    justifyContent: 'center',
  },
  revealButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  revealButtonText: {
    color: '#000',
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  wordContainer: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  wordNumber: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 4,
  },
  word: {
    textAlign: 'center',
  },
  verificationContainer: {
    alignItems: 'center',
    padding: 20,
  },
  verificationText: {
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 