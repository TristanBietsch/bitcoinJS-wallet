import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Check } from 'lucide-react-native'
import { router } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'
import { setOnboardingComplete } from '@/src/utils/storage'

interface SuccessSeedPhraseProps {
  onComplete?: () => void
}

export default function SuccessSeedPhrase({ onComplete }: SuccessSeedPhraseProps) {
  
  const handleGoHome = async () => {
    try {
      // First, mark onboarding as complete in storage
      await setOnboardingComplete()
      
      // Then navigate to home screen
      router.replace('/' as any)
      
      // Also call onComplete if provided (for backward compatibility)
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still try to navigate even if there was an error
      router.replace('/' as any)
    }
  }
  
  return (
    <OnboardingContainer>
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Success!
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Your wallet is ready to go.
        </ThemedText>
        
        <View style={styles.iconContainer}>
          <Check 
            size={80} 
            color="#00C853" 
            strokeWidth={2}
          />
        </View>
      </View>
      
      <OnboardingButton
        label="Go Home"
        onPress={handleGoHome}
        style={styles.homeButton}
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
    fontSize     : 32,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10
  },
  subtitle : {
    fontSize     : 18,
    textAlign    : 'center',
    marginBottom : 60
  },
  iconContainer : {
    marginVertical : 40,
    alignItems     : 'center',
    justifyContent : 'center'
  },
  homeButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 30,
    width           : '100%'
  }
})
