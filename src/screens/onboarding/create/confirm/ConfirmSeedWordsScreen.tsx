import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import SeedPhraseWordGrid from '@/src/components/features/Wallet/SeedPhrase/SeedPhraseWordGrid'
import ResetSelectionButton from '@/src/components/ui/Button/ResetSelectionButton'
import { useSeedPhraseSelection } from '@/src/hooks/wallet/useSeedPhraseSelection'
import { useSeedPhraseVerificationFlow } from '@/src/hooks/wallet/useSeedPhraseVerificationFlow'
import CheckingSeedPhrase from '../checking/CheckingSeedPhrase'
import ErrorSeedPhrase from '../error/ErrorSeedPhrase'
import SuccessSeedPhrase from '../success/SuccessSeedPhrase'
import { Colors } from '@/src/constants/colors'

// Mock seed phrase for demonstration
const MOCK_SEED_PHRASE = [
  '1', '2', '3', '4', '5', '6',
  '7', '8', '9', '10', '11', '12'
]

interface ConfirmSeedWordsScreenProps {
  onComplete: () => void
  onBack: () => void
}

export default function ConfirmSeedWordsScreen({ onComplete, onBack }: ConfirmSeedWordsScreenProps) {
  // Use our modular seed phrase selection hook
  const {
    selectedWords,
    shuffledWords,
    handleWordSelect,
    resetSelection,
    getOrderedSelectedWords,
    isSelectionComplete
  } = useSeedPhraseSelection(MOCK_SEED_PHRASE)
  
  // Use our verification flow hook
  const {
    verificationState,
    startVerification,
    handleVerificationComplete,
    handleTryAgain,
    handleComplete
  } = useSeedPhraseVerificationFlow(onComplete, resetSelection)
  
  // Render different screens based on verification state
  if (verificationState === 'checking') {
    return (
      <CheckingSeedPhrase
        originalSeedPhrase={MOCK_SEED_PHRASE}
        selectedWords={getOrderedSelectedWords()}
        onVerificationComplete={handleVerificationComplete}
      />
    )
  }
  
  if (verificationState === 'error') {
    return (
      <ErrorSeedPhrase
        onTryAgain={handleTryAgain}
        onBack={onBack}
      />
    )
  }
  
  if (verificationState === 'success') {
    return (
      <SuccessSeedPhrase
        onComplete={handleComplete}
      />
    )
  }
  
  // Default selection screen
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Verify Your Backup
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Select the words in the correct order of your seed phrase
        </ThemedText>
        
        {/* Word Grid using our extracted component */}
        <SeedPhraseWordGrid
          words={shuffledWords}
          selectedWords={selectedWords}
          onWordSelect={handleWordSelect}
          maxSelections={12}
        />
        
        {/* Reset Button using our extracted component */}
        <ResetSelectionButton
          onPress={resetSelection}
          disabled={selectedWords.length === 0}
        />
      </View>
      
      <OnboardingButton
        label="Confirm"
        onPress={isSelectionComplete ? startVerification : () => {}}
        style={{
          ...styles.confirmButton,
          ...(isSelectionComplete ? {} : { opacity: 0.5 })
        }}
      />
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 16,
    marginTop         : 60
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10,
    marginTop    : 120
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 30
  },
  confirmButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 30,
    width           : '100%'
  }
}) 