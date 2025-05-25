import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { OnboardingContainer } from '@/src/components/ui/OnboardingScreen'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { useWalletStore } from '@/src/store/walletStore'

interface CheckingSeedPhraseImportProps {
}

/**
 * Screen component shown during seed phrase import verification and balance fetching
 */
export default function CheckingSeedPhraseImport({}: CheckingSeedPhraseImportProps) {
  const [ status, setStatus ] = useState('Validating seed phrase...')
  const isSyncing = useWalletStore(state => state.isSyncing)
  
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
          return 'Creating wallet...'
        } else if (currentStatus === 'Creating wallet...') {
          return 'Fetching wallet balance...'
        } else if (currentStatus === 'Fetching wallet balance...') {
          // Once we've shown the balance fetching message, we'll keep showing it
          // until the actual balance is fetched
          if (isSyncing) {
            return 'Fetching wallet balance...'
          } else {
            return 'Import complete!'
          }
        }
        return currentStatus
      })
    }, 1200) // Slightly faster cycling for better UX
    
    return () => clearInterval(timer)
  }, [ isSyncing ])
  
  return (
    <OnboardingContainer>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.buttons.primary} />
        <ThemedText style={styles.title}>Importing Wallet</ThemedText>
        <ThemedText style={styles.description}>
          {status} {/* Display cycled status */}
        </ThemedText>
        {status === 'Import complete!' && (
          <ThemedText style={styles.success}>
            Your wallet has been successfully imported!
          </ThemedText>
        )}
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
  },
  success : {
    fontSize   : 16,
    textAlign  : 'center',
    color      : Colors.light.buttons.primary,
    fontWeight : 'bold',
    marginTop  : 20,
  }
})
