import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardingContainer, OnboardingTitle } from '@/src/components/ui/OnboardingScreen'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { ThemedText } from '@/src/components/ui/Text'

// Import our custom hooks
import { useSeedPhraseValidation } from '@/src/hooks/wallet/useSeedPhraseValidation'
import { useSeedPhraseSecurity } from '@/src/hooks/security/useSeedPhraseSecurity'
import { useSeedPhraseInput } from '@/src/hooks/wallet/useSeedPhraseInput'

// Import our modular components
import SeedPhraseInput from '@/src/components/features/Wallet/Import/SeedPhraseInput'
import ValidationFeedback from '@/src/components/features/Wallet/Import/ValidationFeedback'
import ImportButton from '@/src/components/features/Wallet/Import/ImportButton'

interface ImportWalletScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

/**
 * Screen for importing a wallet with a seed phrase
 */
export default function ImportWalletScreen({ onComplete, onBack }: ImportWalletScreenProps) {
  // Use our custom hooks
  const { seedPhrase, handleSeedPhraseChange, clearSeedPhrase } = useSeedPhraseInput()
  const { securelyStoreSeedPhrase, error: securityError } = useSeedPhraseSecurity(seedPhrase)
  const { 
    validationResult, 
    wordValidations, 
    showValidation, 
    setShowValidation,
    successAnim,
    suggestionText
  } = useSeedPhraseValidation(seedPhrase)

  // Show validation feedback when there's a security error
  useEffect(() => {
    if (securityError) {
      setShowValidation(true)
    }
  }, [ securityError, setShowValidation ])

  const handleImport = async () => {
    // Only proceed if the seed phrase is valid
    if (validationResult.isValid) {
      const success = await securelyStoreSeedPhrase()
      
      if (success) {
        // Clear the UI
        clearSeedPhrase()
        // Complete the import process
        onComplete()
      } else {
        // Error is handled by the hook and displayed through validation
        setShowValidation(true)
      }
    } else {
      // Force show validation if user tries to submit invalid phrase
      setShowValidation(true)
    }
  }

  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <OnboardingTitle>
          Import Wallet
        </OnboardingTitle>
        
        <ThemedText style={styles.description}>
          Enter your seed phrase to import your wallet. Separate each word by a space.
        </ThemedText>

        <View style={styles.inputContainer}>
          {/* Seed phrase input with validation */}
          <SeedPhraseInput
            value={seedPhrase}
            onChangeText={(text) => {
              handleSeedPhraseChange(text)
              // Show validation feedback once user starts typing
              if (!showValidation && text.trim()) {
                setShowValidation(true)
              }
            }}
            wordValidations={wordValidations}
            isValid={validationResult.isValid}
            showValidation={showValidation}
          />
          
          {/* Validation feedback */}
          <ValidationFeedback
            validationResult={securityError 
              ? { ...validationResult, isValid: false, errorMessage: securityError } 
              : validationResult
            }
            showValidation={showValidation}
            suggestionText={suggestionText}
            successAnim={successAnim}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ImportButton
          onPress={handleImport}
          disabled={!validationResult.isValid}
        />
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex           : 1,
    alignItems     : 'center',
    justifyContent : 'flex-start',
    width          : '100%',
    paddingTop     : 140,
  },
  description : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 32,
    paddingHorizontal : 30,
    opacity           : 0.7,
  },
  inputContainer : {
    width             : '100%',
    paddingHorizontal : 20,
  },
  buttonContainer : {
    width             : '100%',
    paddingHorizontal : 20,
    marginBottom      : 40,
  }
}) 