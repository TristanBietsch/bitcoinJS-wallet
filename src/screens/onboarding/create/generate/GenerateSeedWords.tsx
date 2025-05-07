import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'
import RevealableContent from '@/src/components/ui/Security/RevealableContent'
import SeedPhraseDisplay from '@/src/components/features/Wallet/SeedPhrase/SeedPhraseDisplay'
import WarningMessage from '@/src/components/ui/Feedback/WarningMessage'
import { useContentRevealGuard } from '@/src/hooks/security/useContentRevealGuard'
import { 
  handleSeedPhraseContinue, 
  handleSeedPhraseBack,
  trackSeedPhraseReveal,
  generateSeedPhrase
} from '@/src/handlers/wallet/seedPhraseHandlers'

interface GenerateSeedWordsProps {
  onComplete: () => void
  onBack: () => void
}

/**
 * Screen for displaying and securing the generated seed phrase
 */
export default function GenerateSeedWords({ onComplete, onBack }: GenerateSeedWordsProps) {
  // Generate seed phrase
  const seedPhrase = useMemo(() => generateSeedPhrase(12), [])
  
  // Use our content reveal hook to manage visibility
  const { 
    isRevealed, 
    hasBeenRevealed, 
    toggleVisibility, 
    canProceed 
  } = useContentRevealGuard(
    // First reveal callback
    () => console.log('Seed phrase revealed for the first time'),
    // Toggle callback - track each visibility change
    (revealed) => trackSeedPhraseReveal(revealed)
  )
  
  // Get handlers
  const handleContinue = handleSeedPhraseContinue(canProceed, onComplete)
  const handleBack = handleSeedPhraseBack(onBack)
  
  return (
    <OnboardingContainer>
      <BackButton onPress={handleBack} />
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Backup Your Seed Phrase
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Write down these 12 words in order and store them securely.
        </ThemedText>
        
        <View style={styles.seedContainer}>
          <RevealableContent
            isRevealed={isRevealed}
            onToggle={toggleVisibility}
            revealText="Tap To Reveal"
            hideText="Tap To Hide"
          >
            <SeedPhraseDisplay 
              seedPhrase={seedPhrase} 
              columns={2}
              startFromOne={true}
            />
          </RevealableContent>
        </View>
        
        {!hasBeenRevealed && (
          <WarningMessage
            message="You must reveal your seed phrase before continuing"
            iconSize={18}
            iconColor="#E8AB2F"
          />
        )}
      </View>
      
      <OnboardingButton
        label="Verify Backup"
        onPress={handleContinue}
        style={canProceed ? styles.confirmButton : { ...styles.confirmButton, ...styles.disabledButton }}
      />
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 20,
    marginTop         : 30,
  },
  title : {
    fontSize     : 32,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10,
    marginTop    : 120,
  },
  subtitle : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 40,
    paddingHorizontal : 20,
  },
  seedContainer : {
    backgroundColor : '#F5F5F5',
    borderRadius    : 20,
    width           : '100%',
    padding         : 20,
    minHeight       : 320,
    position        : 'relative',
    overflow        : 'hidden',
  },
  confirmButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 50,
    width           : '100%',
  },
  disabledButton : {
    opacity : 0.5,
  }
})
