import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { useImport } from '@/src/features/wallet/import/ImportContext'
import { setOnboardingComplete } from '@/src/utils/storage'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import ConfettiAnimation from '@/src/components/ui/Animations/ConfettiAnimation'
import { OnboardingButton } from '@/src/components/ui/Button'

interface SuccessImportProps {
  onComplete: () => void
}

/**
 * Screen displayed when wallet import succeeds
 */
export default function SuccessImport({ onComplete }: SuccessImportProps) {
  const { wallet } = useImport()
  
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
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    paddingHorizontal : 20
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 40
  },
  walletInfoContainer : {
    width           : '100%',
    padding         : 16,
    backgroundColor : Colors.light.offWhite,
    borderRadius    : 8,
    marginTop       : 20,
    marginBottom    : 30,
  },
  infoTitle : {
    fontSize     : 14,
    fontWeight   : 'bold',
    marginBottom : 8,
  },
  infoItem : {
    fontSize     : 12,
    marginBottom : 4,
  },
  primaryButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 30,
    width           : '100%'
  }
})
