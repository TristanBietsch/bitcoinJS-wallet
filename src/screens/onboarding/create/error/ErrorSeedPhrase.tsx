import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { X } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
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
            size={80} 
            color="#FF0000" 
            strokeWidth={2}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={onTryAgain}
        >
          <ThemedText style={styles.tryAgainText}>
            ← Try again
          </ThemedText>
        </TouchableOpacity>
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 20,
    marginTop         : 60
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
    marginBottom : 60
  },
  iconContainer : {
    marginVertical : 40,
    alignItems     : 'center',
    justifyContent : 'center',
    flex           : 1
  },
  tryAgainButton : {
    marginBottom : 30
  },
  tryAgainText : {
    fontSize   : 18,
    fontWeight : '500',
    color      : Colors.light.buttons.primary
  }
})
