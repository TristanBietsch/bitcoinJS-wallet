import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { OnboardingContainer } from '@/src/components/ui/OnboardingScreen'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
// import { bitcoinWalletService } from '@/src/services/bitcoin/wallet/bitcoinWalletService' // No longer needed for validation here

interface CheckingSeedPhraseImportProps {
  // seedPhrase: string // Removed as it's not used
}

/**
 * Screen component shown during seed phrase import verification
 */
export default function CheckingSeedPhraseImport({ 
  // seedPhrase // Removed
}: CheckingSeedPhraseImportProps) {
  const [ status, setStatus ] = useState('Validating seed phrase...')
  
  useEffect(() => {
    // Timer for cycling through status messages for better UX
    // This is purely for display while the store is processing the import.
    const timer = setInterval(() => {
      setStatus(currentStatus => {
        if (currentStatus === 'Validating seed phrase...') {
          return 'Generating wallet keys...'
        } else if (currentStatus === 'Generating wallet keys...') {
          return 'Deriving addresses...'
        } else if (currentStatus === 'Deriving addresses...') {
          return 'Completing import...'
        }
        return currentStatus
      })
    }, 1500)
    
    return () => clearInterval(timer)
  }, [])
  
  // Removed the useEffect that called processImport, onComplete, onError
  
  return (
    <OnboardingContainer>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.buttons.primary} />
        <ThemedText style={styles.title}>Importing Wallet</ThemedText>
        <ThemedText style={styles.description}>
          {status} {/* Display cycled status */}
        </ThemedText>
        {/* Optionally display parts of seedPhrase if needed for UI, though usually not here */}
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex              : 1,
    justifyContent    : 'center',
    alignItems        : 'center',
    paddingHorizontal : 20,
  },
  title : {
    fontSize     : 24,
    fontWeight   : 'bold',
    marginTop    : 20,
    marginBottom : 10,
  },
  description : {
    fontSize  : 16,
    textAlign : 'center',
    opacity   : 0.7,
  }
})
