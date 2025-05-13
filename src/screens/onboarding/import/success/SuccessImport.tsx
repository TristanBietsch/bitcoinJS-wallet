import React from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardingContainer, OnboardingTitle } from '@/src/components/ui/OnboardingScreen'
import { ThemedText } from '@/src/components/ui/Text'
import { OnboardingButton } from '@/src/components/ui/Button'
import { CheckCircle } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'
import { useImport } from '@/src/features/wallet/import/ImportContext'

interface SuccessImportProps {
  onComplete: () => void
}

/**
 * Screen displayed when wallet import succeeds
 */
export default function SuccessImport({ onComplete }: SuccessImportProps) {
  const { wallet } = useImport()
  
  return (
    <OnboardingContainer>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color={Colors.light.successGreen} />
        </View>
        
        <OnboardingTitle>Wallet Imported</OnboardingTitle>
        
        <ThemedText style={styles.description}>
          Your wallet has been successfully imported. You can now start using Nummus.
        </ThemedText>
        
        {wallet && (
          <View style={styles.walletInfoContainer}>
            <ThemedText style={styles.infoTitle}>Wallet Details</ThemedText>
            <ThemedText style={styles.infoItem}>
              Receiving Address: {wallet.addresses.nativeSegwit[0]}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <OnboardingButton label="Continue" onPress={onComplete} />
        </View>
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
  iconContainer : {
    marginBottom : 20,
  },
  description : {
    fontSize       : 16,
    textAlign      : 'center',
    marginVertical : 20,
    opacity        : 0.7,
  },
  walletInfoContainer : {
    width           : '100%',
    padding         : 16,
    backgroundColor : Colors.light.offWhite,
    borderRadius    : 8,
    marginTop       : 16,
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
  buttonContainer : {
    width     : '100%',
    marginTop : 30,
  }
})
