import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { FileLock2, ArrowRight } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import { OnboardingTitle, OnboardingDescription } from '@/src/components/ui/OnboardingScreen'

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
        
        <View style={styles.iconContainer}>
          <FileLock2 size={90} color="#FFFFFF" />
        </View>
        
        <ThemedText style={styles.securityText}>
          Write down your seed phrase on paper. Store it somewhere safe and
          and never share it with anyone. The seed is the only way to recover your
          wallet.
        </ThemedText>
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={onComplete}
      >
        <View style={styles.buttonContent}>
          <ThemedText style={styles.buttonText}>
            I am Ready
          </ThemedText>
          <ArrowRight 
            size={20} 
            color="#FFFFFF" 
            style={styles.buttonIcon} 
          />
        </View>
      </TouchableOpacity>
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
    marginBottom : 60,
  },
  iconContainer : {
    width           : 200,
    height          : 200,
    borderRadius    : 200,
    backgroundColor : '#2FA558',
    alignItems      : 'center',
    justifyContent  : 'center',
    marginBottom    : 48,
  },
  securityText : {
    textAlign    : 'center',
    fontSize     : 16,
    lineHeight   : 24,
    marginBottom : 60,
  },
  nextButton : {
    backgroundColor  : '#24126A',
    paddingVertical  : 16,
    borderRadius     : 30,
    marginHorizontal : 30,
    marginBottom     : 50,
    width            : '100%',
  },
  buttonContent : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  buttonText : {
    color       : '#FFFFFF',
    fontSize    : 16,
    fontWeight  : 'bold',
    marginRight : 8,
  },
  buttonIcon : {
    marginLeft : 4,
  }
}) 