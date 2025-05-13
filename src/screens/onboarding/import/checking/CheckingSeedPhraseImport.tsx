import React, { useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { OnboardingContainer } from '@/src/components/ui/OnboardingScreen'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { bitcoinWalletService } from '@/src/services/bitcoin/wallet/bitcoinWalletService'

interface CheckingSeedPhraseImportProps {
  seedPhrase: string
  onComplete: () => void
  onError: (message?: string) => void
  isTestBypass?: boolean
}

/**
 * Screen component shown during seed phrase import verification
 */
export default function CheckingSeedPhraseImport({
  seedPhrase,
  onComplete,
  onError,
  isTestBypass = false
}: CheckingSeedPhraseImportProps) {
  
  useEffect(() => {
    async function processImport() {
      // If it's a test bypass, just complete after a delay
      if (isTestBypass) {
        setTimeout(() => {
          onComplete();
        }, 2000);
        return;
      }
      
      try {
        // Validate the seed phrase
        if (!bitcoinWalletService.validateMnemonic(seedPhrase)) {
          throw new Error('Invalid seed phrase');
        }
        
        // For test purposes, show loading state for at least 1.5 seconds
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Complete the import process
        onComplete();
      } catch (error) {
        console.error('Error during wallet import:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to import wallet';
        onError(errorMessage);
      }
    }
    
    processImport();
  }, [seedPhrase, onComplete, onError, isTestBypass]);
  
  return (
    <OnboardingContainer>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.title}>Importing Wallet</ThemedText>
        <ThemedText style={styles.description}>
          Please wait while we validate and import your wallet...
        </ThemedText>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  }
});
