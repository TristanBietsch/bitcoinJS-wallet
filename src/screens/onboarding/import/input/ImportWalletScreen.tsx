import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardingContainer, OnboardingTitle } from '@/src/components/ui/OnboardingScreen'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { ThemedText } from '@/src/components/ui/Text'

// Import our custom hooks
import { useSeedPhraseValidation } from '@/src/hooks/wallet/useSeedPhraseValidation'
import { useSeedPhraseInput } from '@/src/hooks/wallet/useSeedPhraseInput'

// Import our modular components
import SeedPhraseInput from '@/src/components/features/Wallet/Import/SeedPhraseInput'
import ValidationFeedback from '@/src/components/features/Wallet/Import/ValidationFeedback'
import ImportButton from '@/src/components/features/Wallet/Import/ImportButton'

// Import shared constants and types
import { TEST_BYPASS_PHRASE, TEST_ERROR_PHRASE } from '@/src/constants/testing'
import { BaseCallbacks } from '@/src/types/ui'
import { useImportStore } from '@/src/store/importStore'

interface ImportWalletScreenProps extends BaseCallbacks {}

/**
 * Screen for importing a wallet with a seed phrase
 * Visual warnings and word chips have been removed while maintaining validation logic
 */
export default function ImportWalletScreen({ onBack }: ImportWalletScreenProps) {
  const { startChecking, setSeedPhrase: setStoreSeedPhrase } = useImportStore.getState()
  const importFlowState = useImportStore(state => state.importFlowState)
  const storeSeedPhrase = useImportStore(state => state.seedPhrase)
  const importErrorFromStore = useImportStore(state => state.importError)

  const { 
    seedPhrase: localSeedPhrase, 
    handleSeedPhraseChange: localHandleSeedPhraseChange, 
  } = useSeedPhraseInput()
  
  const { 
    validationResult, 
    wordValidations,
    showValidation, 
    setShowValidation,
    successAnim
  } = useSeedPhraseValidation(localSeedPhrase)

  useEffect(() => {
    setStoreSeedPhrase(localSeedPhrase)
    if (importErrorFromStore && localSeedPhrase !== storeSeedPhrase && importFlowState !== 'input') {
      // If there was a submission error from store, and user changes input, reset to input state
      useImportStore.getState().returnToInput()
    }
  }, [ localSeedPhrase, setStoreSeedPhrase, importErrorFromStore, storeSeedPhrase, importFlowState ])

  const handleImport = async () => {
    if (localSeedPhrase.trim() === TEST_ERROR_PHRASE || localSeedPhrase.trim() === TEST_BYPASS_PHRASE) {
      startChecking(localSeedPhrase.trim())
      return
    }

    if (validationResult.isValid) {
      startChecking(localSeedPhrase.trim())
    } else {
      setShowValidation(true)
    }
  }
  
  const isLoading = importFlowState === 'checking'

  let feedbackValidationResult = validationResult
  if (importErrorFromStore) {
    // If there is an error from the store (submission error), prioritize showing it.
    // Ensure all fields from ValidationResult are present.
    feedbackValidationResult = {
      ...validationResult, // Base this on current validationResult to preserve other fields if any
      isValid      : false, 
      errorMessage : importErrorFromStore,
      // Explicitly set other potentially required fields if not covered by spread
      // and if validationResult might not be fully formed from an empty phrase.
      // For example, if validationResult is from useSeedPhraseValidation, it should be complete.
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
            value={localSeedPhrase}
            onChangeText={(text) => {
              // Only allow letters and spaces
              const lettersAndSpacesOnly = text.replace(/[^a-zA-Z\s]/g, '')
              // Normalize to lowercase for consistent validation regardless of input case
              const normalizedText = lettersAndSpacesOnly.toLowerCase()
              
              localHandleSeedPhraseChange(normalizedText)
              // Show validation feedback once user starts typing
              if (!showValidation && normalizedText.trim()) {
                setShowValidation(true)
              }
            }}
            wordValidations={wordValidations}
            isValid={validationResult.isValid || localSeedPhrase.trim() === TEST_BYPASS_PHRASE || localSeedPhrase.trim() === TEST_ERROR_PHRASE}
            showValidation={showValidation}
          />
          
          {/* Validation feedback - only shows success state now */}
          <ValidationFeedback
            validationResult={feedbackValidationResult}
            showValidation={showValidation || !!importErrorFromStore}
            suggestionText=""
            successAnim={successAnim}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ImportButton
          onPress={handleImport}
          isLoading={isLoading}
          disabled={!validationResult.isValid && localSeedPhrase.trim() !== TEST_BYPASS_PHRASE && localSeedPhrase.trim() !== TEST_ERROR_PHRASE && !isLoading}
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