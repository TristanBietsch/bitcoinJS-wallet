import React from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardingContainer, OnboardingTitle } from '@/src/components/ui/OnboardingScreen'
import { ThemedText } from '@/src/components/ui/Text'
import { OnboardingButton } from '@/src/components/ui/Button'
import { XCircle } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'
import { useImport } from '@/src/features/wallet/import/ImportContext'

interface ErrorImportProps {
  onTryAgain: () => void
  onBack: () => void
}

/**
 * Screen displayed when wallet import fails
 */
export default function ErrorImport({ onTryAgain, onBack }: ErrorImportProps) {
  const { error } = useImport()
  
  return (
    <OnboardingContainer>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <XCircle size={64} color={Colors.light.errorRed} />
        </View>
        
        <OnboardingTitle>Import Failed</OnboardingTitle>
        
        <ThemedText style={styles.description}>
          {error || 'There was a problem importing your wallet. Please check your seed phrase and try again.'}
        </ThemedText>
        
        <View style={styles.buttonContainer}>
          <OnboardingButton label="Try Again" onPress={onTryAgain} />
          <OnboardingButton 
            label="Go Back" 
            onPress={onBack} 
            style={styles.backButton}
      useLeftArrow={true}
    />
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
  buttonContainer : {
    width     : '100%',
    marginTop : 20,
  },
  backButton : {
    marginTop : 12,
  }
})
