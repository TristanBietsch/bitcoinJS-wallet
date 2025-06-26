import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import { useWalletStore } from '@/src/store/walletStore'
import { setOnboardingComplete } from '@/src/utils/storage'
import OnboardingContainer from '@/src/components/layout/OnboardingContainer'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import ConfettiAnimation from '@/src/components/ui/animations/ConfettiAnimation'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'

interface SuccessImportProps {
  onComplete?: () => void;
}

/**
 * Screen displayed when wallet import succeeds
 */
export default function SuccessImport({ onComplete }: SuccessImportProps) {
  // Get wallet from the Zustand store
  const wallet = useWalletStore(state => state.wallet)
  
  // Set up the confetti animation to play automatically
  useEffect(() => {
    console.log('SuccessImport screen rendered, wallet imported successfully!')
  }, [])
  
  const handleGoHome = async () => {
    try {
      console.log('Navigating to home screen after successful import')
      
      // First, mark onboarding as complete in storage
      await setOnboardingComplete()
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete()
      }
      
      // Allow some time for the animation to be enjoyed before navigating
      // This ensures the user sees the success screen
      setTimeout(() => {
        // Navigate to home screen
        router.replace('/' as any)
      }, 500) // Half second delay
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still try to navigate even if there was an error, but with a delay
      setTimeout(() => {
        router.replace('/' as any)
      }, 500)
    }
  }
  
  return (
    <OnboardingContainer>
      {/* Confetti animation */}
      <ConfettiAnimation autoPlay={true} />
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Wallet Imported!
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Your wallet has been successfully imported and is ready to use.
        </ThemedText>
        
        <StatusIcon type="success" />
        
        {/* Display wallet information */}
        {wallet && (
          <View style={styles.walletInfoContainer}>
            <ThemedText style={styles.infoTitle}>Wallet Details</ThemedText>
            <ThemedText style={styles.infoItem}>Wallet ID: {wallet.id}</ThemedText>
            <ThemedText style={styles.infoItem}>
              Receiving Address: {wallet.addresses.nativeSegwit[0]}
            </ThemedText>
            {wallet.balances && (
              <ThemedText style={styles.infoItem}>
                Balance: {wallet.balances.confirmed} sats
              </ThemedText>
            )}
          </View>
        )}
      </View>
      
      <OnboardingButton
        label="Go to Wallet"
        onPress={handleGoHome}
        style={styles.primaryButton}
      />
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    alignItems     : 'center',
    justifyContent : 'center',
    marginVertical : 24,
    width          : '100%',
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    marginBottom : 12,
    textAlign    : 'center',
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 40,
    opacity      : 0.8,
  },
  walletInfoContainer : {
    backgroundColor : '#F5F7FF',
    borderRadius    : 12,
    padding         : 16,
    width           : '100%',
    marginTop       : 24,
  },
  infoTitle : {
    fontSize     : 18,
    fontWeight   : 'bold',
    marginBottom : 12,
  },
  infoItem : {
    fontSize     : 14,
    marginBottom : 8,
    opacity      : 0.8,
  },
  primaryButton : {
    marginTop : 24,
  },
})
