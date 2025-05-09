import React, { useEffect, useState } from 'react'
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
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { keyManagement } from '@/src/services/bitcoin/wallet/keyManagement'
import { BITCOIN_NETWORK } from '@/src/config/bitcoinNetwork'

interface ConfirmSeedWordsScreenProps {
  onComplete: () => void
  onBack: () => void
}

export default function ConfirmSeedWordsScreen({ onComplete, onBack }: ConfirmSeedWordsScreenProps) {
  // State for retrieving the seed phrase
  const [storedSeedPhrase, setStoredSeedPhrase] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Fetch stored seed phrase on component mount
  useEffect(() => {
    const fetchSeedPhrase = async () => {
      try {
        setIsLoading(true)
        
        // Retrieve the seed phrase from secure storage
        const seedPhrase = await seedPhraseService.retrieveSeedPhrase()
        
        if (!seedPhrase) {
          setLoadError('Could not find your seed phrase. Please go back and try again.')
          setIsLoading(false)
          return
        }
        
        // Convert to array of words
        const seedPhraseWords = seedPhraseService.getWords(seedPhrase)
        setStoredSeedPhrase(seedPhraseWords)
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load seed phrase:', error)
        setLoadError('Failed to retrieve your seed phrase')
        setIsLoading(false)
      }
    }
    
    fetchSeedPhrase()
  }, [])
  
  // Use our modular seed phrase selection hook
  const {
    selectedWords,
    shuffledWords,
    handleWordSelect,
    resetSelection,
    getOrderedSelectedWords,
    isSelectionComplete
  } = useSeedPhraseSelection(storedSeedPhrase)
  
  // Use our verification flow hook
  const {
    verificationState,
    startVerification,
    handleVerificationComplete,
    handleTryAgain,
    handleComplete
  } = useSeedPhraseVerificationFlow(onComplete, resetSelection)
  
  // Handle verification of seed phrase with real bitcoin keys
  useEffect(() => {
    if (verificationState !== 'checking') return
    
    const verifySelectedPhrase = async () => {
      try {
        // Get the selected words in order
        const selectedPhrase = getOrderedSelectedWords()
        const originalPhrase = storedSeedPhrase
        
        // Basic verification - words match exactly
        const wordsMatch = selectedPhrase.length === originalPhrase.length &&
          selectedPhrase.every((word, index) => word === originalPhrase[index])
        
        if (!wordsMatch) {
          handleVerificationComplete(false)
          return
        }
        
        // Advanced verification - validate as Bitcoin key
        const joinedPhrase = selectedPhrase.join(' ')
        
        // First check if it's a valid mnemonic
        const isValidMnemonic = seedPhraseService.validateMnemonic(joinedPhrase)
        
        if (!isValidMnemonic) {
          handleVerificationComplete(false)
          return
        }
        
        // Get original address for comparison
        const originalSeedString = storedSeedPhrase.join(' ')
        const originalKeyPair = await keyManagement.deriveFromMnemonic(
          originalSeedString,
          undefined,
          BITCOIN_NETWORK
        )
        
        // Derive address from selected words
        const selectedKeyPair = await keyManagement.deriveFromMnemonic(
          joinedPhrase,
          undefined,
          BITCOIN_NETWORK
        )
        
        // Compare addresses to ensure they match
        const addressesMatch = originalKeyPair.address === selectedKeyPair.address
        
        // Complete verification based on the result
        handleVerificationComplete(addressesMatch)
        
        // For development: log verification details (remove in production)
        console.log('Seed phrase verification:', {
          wordsMatch,
          isValidMnemonic,
          addressesMatch,
          originalAddress: originalKeyPair.address,
          selectedAddress: selectedKeyPair.address
        })
        
      } catch (error) {
        console.error('Verification error:', error)
        handleVerificationComplete(false)
      }
    }
    
    verifySelectedPhrase()
  }, [verificationState, getOrderedSelectedWords, storedSeedPhrase, handleVerificationComplete])
  
  // Render different screens based on verification state
  if (verificationState === 'checking') {
    return (
      <CheckingSeedPhrase
        originalSeedPhrase={storedSeedPhrase}
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
  
  // Show loading state
  if (isLoading) {
    return (
      <OnboardingContainer>
        <BackButton onPress={onBack} />
        <View style={styles.content}>
          <ThemedText style={styles.title}>
            Loading Your Seed Phrase
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Please wait while we prepare verification...
          </ThemedText>
        </View>
      </OnboardingContainer>
    )
  }
  
  // Show error state if loading failed
  if (loadError) {
    return (
      <OnboardingContainer>
        <BackButton onPress={onBack} />
        <View style={styles.content}>
          <ThemedText style={styles.title}>
            Error Loading Seed Phrase
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {loadError}
          </ThemedText>
          <OnboardingButton
            label="Go Back"
            onPress={onBack}
            style={styles.confirmButton}
          />
        </View>
      </OnboardingContainer>
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
    marginBottom    : 50,
    width           : '100%'
  }
}) 