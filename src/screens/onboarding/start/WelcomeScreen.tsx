import React from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardingContainer, OnboardingTitle, OnboardingDescription } from '@/src/components/ui/OnboardingScreen'
import { OnboardingButton } from '@/src/components/ui/Button'

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <OnboardingContainer>
      <View style={styles.content}>
        <OnboardingTitle>
          Welcome to Nummus
        </OnboardingTitle>
        
        <OnboardingDescription>
          A Simple and Secure base layer wallet for transactions. Your keys, your coins.
        </OnboardingDescription>
      </View>

      <View style={styles.buttonContainer}>
        <OnboardingButton
          label="Get Started"
          onPress={onGetStarted}
        />
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex           : 1,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  buttonContainer : {
    width        : '100%',
    marginBottom : 40,
  },
}) 