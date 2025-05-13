import React, { useEffect, useState } from 'react'
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
  const [ status, setStatus ] = useState('Validating seed phrase...')
  
  useEffect(() => {
    // Add a timer to track processing time and provide better feedback
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
  
  useEffect(() => {
    let isMounted = true
    
    async function processImport() {
      // If it's a test bypass, just complete after a delay
      if (isTestBypass) {
        setTimeout(() => {
          if (isMounted) onComplete()
        }, 2000)
        return
      }
      
      try {
        // Validate the seed phrase first
        if (!bitcoinWalletService.validateMnemonic(seedPhrase)) {
          throw new Error('Invalid seed phrase')
        }
        
        // For test purposes, ensure minimum loading time for UX consistency
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Complete the import process only if component is still mounted
        if (isMounted) onComplete()
      } catch (error) {
        // Only send error if component is still mounted
        if (isMounted) {
          console.error('Error during wallet import:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to import wallet'
          onError(errorMessage)
        }
      }
    }
    
    processImport()
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false
    }
  }, [ seedPhrase, onComplete, onError, isTestBypass ])
  
  return (
    <OnboardingContainer>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.buttons.primary} />
        <ThemedText style={styles.title}>Importing Wallet</ThemedText>
        <ThemedText style={styles.description}>
          {status}
        </ThemedText>
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
