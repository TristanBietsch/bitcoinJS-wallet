import React from 'react'
import { View, StyleSheet } from 'react-native'
import { FileLock2 } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import { OnboardingTitle, OnboardingDescription } from '@/src/components/ui/OnboardingScreen'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'

interface PreparePhraseScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function PreparePhraseScreen({ onComplete, onBack }: PreparePhraseScreenProps) {
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <OnboardingTitle>
          Prepare for Backup
        </OnboardingTitle>
        
        <OnboardingDescription style={styles.subtitle}>
          We will ask you to write down your seed.
        </OnboardingDescription>
        
        <FileLock2 
          size={140} 
          color={Colors.light.buttons.primary} 
          style={styles.icon}
        />
        
        <ThemedText style={styles.securityText}>
          Write down your seed phrase on paper. Store it somewhere safe and
          and never share it with anyone. The seed is the only way to recover your
          wallet.
        </ThemedText>
      </View>
      
      <OnboardingButton
        label="Generate My Seed"
        onPress={onComplete}
        style={styles.nextButton}
      />
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    marginTop         : 140,
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    width             : '100%',
    paddingHorizontal : 24,
  },
  subtitle : {
    marginBottom : 100,
  },
  icon : {
    marginBottom : 80,
  },
  securityText : {
    textAlign    : 'center',
    fontSize     : 16,
    lineHeight   : 24,
    marginBottom : 60,
  },
  nextButton : {
    backgroundColor  : Colors.light.buttons.primary,
    marginHorizontal : 30,
    marginBottom     : 50,
    width            : '100%',
  }
}) 