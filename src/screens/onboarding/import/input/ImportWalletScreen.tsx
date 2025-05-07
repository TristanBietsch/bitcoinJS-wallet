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

// Import shared constants and types
import { TEST_BYPASS_PHRASE, TEST_ERROR_PHRASE } from '@/src/constants/testing'
import { BaseCallbacks } from '@/src/types/ui'
import { useImport } from '@/src/features/wallet/import/ImportContext'

interface ImportWalletScreenProps extends BaseCallbacks {}

/**
 * Screen for importing a wallet with a seed phrase
 * Visual warnings and word chips have been removed while maintaining validation logic
 */
export default function ImportWalletScreen({ onBack }: ImportWalletScreenProps) {
  // Context from ImportProvider
  const { startChecking } = useImport()
  
  // Use our custom hooks
  const { seedPhrase, handleSeedPhraseChange, clearSeedPhrase } = useSeedPhraseInput()
  const { securelyStoreSeedPhrase, error: securityError } = useSeedPhraseSecurity(seedPhrase)
  const { 
    validationResult, 
    wordValidations, // Still using this for validation logic, but not displaying it
    showValidation, 
    setShowValidation,
    successAnim
  } = useSeedPhraseValidation(seedPhrase)

  // Show validation feedback when there's a security error
  useEffect(() => {
    if (securityError) {
      setShowValidation(true)
    }
  }, [ securityError, setShowValidation ])

  const handleImport = async () => {
    // Test error phrase check - go to checking screen first, then error
    if (seedPhrase.trim() === TEST_ERROR_PHRASE) {
      const currentPhrase = seedPhrase.trim()
      clearSeedPhrase()
      startChecking(currentPhrase)
      return
    }
    
    // Test bypass check
    if (seedPhrase.trim() === TEST_BYPASS_PHRASE) {
      const currentPhrase = seedPhrase.trim()
      clearSeedPhrase()
      startChecking(currentPhrase)
      return
    }

    // Only proceed if the seed phrase is valid
    if (validationResult.isValid) {
      const success = await securelyStoreSeedPhrase()
      
      if (success) {
        // Store the phrase for verification before clearing the UI
        const currentPhrase = seedPhrase.trim()
        clearSeedPhrase()
        startChecking(currentPhrase)
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
      <BackButton onPress={onBack || (() => {})} />
      
      <View style={styles.content}>
        <OnboardingTitle>
          Import Wallet
        </OnboardingTitle>
        
        <ThemedText style={styles.description}>
          Enter your seed phrase to import your wallet. Separate each word by a space.
        </ThemedText>

        <View style={styles.inputContainer}>
          {/* Seed phrase input with validation logic but no visual word chips */}
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
            isValid={validationResult.isValid || seedPhrase.trim() === TEST_BYPASS_PHRASE || seedPhrase.trim() === TEST_ERROR_PHRASE}
            showValidation={showValidation}
          />
          
          {/* Validation feedback - only shows success state now */}
          <ValidationFeedback
            validationResult={securityError 
              ? { ...validationResult, isValid: false, errorMessage: securityError } 
              : validationResult
            }
            showValidation={showValidation}
            suggestionText=""
            successAnim={successAnim}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ImportButton
          onPress={handleImport}
          disabled={!validationResult.isValid && seedPhrase.trim() !== TEST_BYPASS_PHRASE && seedPhrase.trim() !== TEST_ERROR_PHRASE}
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