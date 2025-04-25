import React from 'react'
import { View, StyleSheet } from 'react-native'
import { X } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'

interface ErrorSeedPhraseProps {
  onTryAgain: () => void
  onBack: () => void
}

export default function ErrorSeedPhrase({ onTryAgain, onBack }: ErrorSeedPhraseProps) {
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Phrase Doesn't Match
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Double-Check Your Sequence. Enter your Seed Phrase Words in Original Order.
        </ThemedText>
        
        <View style={styles.iconContainer}>
          <X 
            size={90} 
            color={Colors.light.errorRed} 
            strokeWidth={2}
          />
        </View>
      </View>
      
      <OnboardingButton
        label="Try Again"
        onPress={onTryAgain}
        style={styles.tryAgainButton}
        useLeftArrow={true}
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
    width           : 160,
    height          : 160,
    borderRadius    : 80,
    backgroundColor : Colors.light.errorIconBg,
    alignItems      : 'center',
    justifyContent  : 'center',
    marginVertical  : 40
  },
  tryAgainButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 30,
    width           : '100%'
  }
})
