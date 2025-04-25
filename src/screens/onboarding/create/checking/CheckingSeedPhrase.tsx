import React, { useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import { Colors } from '@/src/constants/colors'

interface CheckingSeedPhraseProps {
  originalSeedPhrase: string[]
  selectedWords: string[]
  onVerificationComplete: (success: boolean) => void
}

export default function CheckingSeedPhrase({ 
  originalSeedPhrase,
  selectedWords,
  onVerificationComplete
}: CheckingSeedPhraseProps) {
  
  useEffect(() => {
    // Simulate checking process
    const timer = setTimeout(() => {
      // Compare original seed phrase with selected words
      const isCorrect = originalSeedPhrase.every((word, index) => word === selectedWords[index])
      onVerificationComplete(isCorrect)
    }, 2000) // 2 second delay for verification effect
    
    return () => clearTimeout(timer)
  }, [ originalSeedPhrase, selectedWords, onVerificationComplete ])
  
  return (
    <OnboardingContainer>
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Verifying...
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Checking your seed phrase sequence
        </ThemedText>
        
        <View style={styles.indicatorContainer}>
          <ActivityIndicator size="large" color={Colors.light.buttons.primary} />
        </View>
      </View>
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
  indicatorContainer : {
    marginTop : 20
  }
})
