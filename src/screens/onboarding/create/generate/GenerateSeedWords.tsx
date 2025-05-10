import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
  trackSeedPhraseReveal,
} from '@/src/handlers/wallet/seedPhraseHandlers'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { keyManagement } from '@/src/services/bitcoin/wallet/keyManagement'
import { BITCOIN_NETWORK } from '@/src/config/bitcoinNetwork'
import showConfirmationDialog from '@/src/components/ui/Dialog/ConfirmationDialog'

interface GenerateSeedWordsProps {
  onComplete: () => void
  onBack: () => void
  resetOnboarding: () => void // Prop to reset the entire onboarding flow
}

/**
 * Screen for displaying and securing the generated seed phrase
 */
export default function GenerateSeedWords({ 
  onComplete, 
  onBack, 
  resetOnboarding = onBack // Default to onBack if resetOnboarding not provided
}: GenerateSeedWordsProps) {
  // State for wallet information
  const [ isGenerating, setIsGenerating ] = useState(true)
  const [ walletError, setWalletError ] = useState<string | null>(null)
  const [ storedSeedPhrase, setStoredSeedPhrase ] = useState<string | null>(null)
  
  // Generate cryptographically secure seed phrase using our service
  // Only generate a new one if we don't have one stored
  const seedPhrase = useMemo(() => {
    return storedSeedPhrase || seedPhraseService.generateSeedPhrase(12)
  }, [ storedSeedPhrase ])
  
  // Convert seedPhrase to array of words for display
  const seedPhraseWords = useMemo(() => {
    return seedPhraseService.getWords(seedPhrase)
  }, [ seedPhrase ])
  
  // Check for existing wallet on mount
  useEffect(() => {
    const checkExistingWallet = async () => {
      try {
        // Check if we already generated a wallet during this session
        const existingSeedPhrase = await seedPhraseService.retrieveSeedPhrase()
        if (existingSeedPhrase) {
          console.log("Found existing wallet, using stored seed phrase")
          setStoredSeedPhrase(existingSeedPhrase)
          setIsGenerating(false)
          return
        }
        
        // If no existing wallet, continue with wallet generation
        setupWallet()
      } catch (error) {
        console.error('Error checking for existing wallet:', error)
        setWalletError('Error checking for existing wallet')
        setIsGenerating(false)
      }
    }
    
    checkExistingWallet()
  }, [])
  
  // Generate Bitcoin keys from the seed phrase
  const setupWallet = async () => {
    try {
      setIsGenerating(true)
      
      // Generate the Bitcoin key pair
      const keyPair = await keyManagement.deriveFromMnemonic(
        seedPhrase,
        undefined, // Use default derivation path
        BITCOIN_NETWORK // Use configured network (regtest, testnet, or mainnet)
      )
      
      // Store the seed phrase securely
      await seedPhraseService.storeSeedPhrase(seedPhrase)
      
      // For development: log the generated address (remove in production)
      console.log(`Generated ${BITCOIN_NETWORK} address: ${keyPair.address}`)
      
      setIsGenerating(false)
    } catch (error) {
      console.error('Failed to setup wallet:', error)
      setWalletError(error instanceof Error ? error.message : 'Unknown error')
      setIsGenerating(false)
    }
  }
  
  // Custom back handler with confirmation using our modular component
  const handleBackWithConfirmation = useCallback(() => {
    showConfirmationDialog({
      title        : "Abandon Wallet Creation?",
      message      : "If you go back now, this wallet will be abandoned and you'll need to start over. Are you sure?",
      confirmText  : "Yes, Start Over",
      confirmStyle : "destructive",
      onConfirm    : resetOnboarding
    })
  }, [ resetOnboarding ])
  
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
  
  // Handle continue action - now wraps seed phrase storage
  const handleContinue = async () => {
    if (!canProceed) return
    
    try {
      // Ensure seed phrase is stored before continuing
      if (!(await seedPhraseService.retrieveSeedPhrase())) {
        await seedPhraseService.storeSeedPhrase(seedPhrase)
      }
      
      // Continue to the next screen
      onComplete()
    } catch (error) {
      console.error('Failed to store seed phrase:', error)
      setWalletError('Failed to secure your seed phrase')
    }
  }
  
  // Show loading state while generating wallet
  if (isGenerating) {
    return (
      <OnboardingContainer>
        <BackButton onPress={handleBackWithConfirmation} />
        <View style={styles.content}>
          <ThemedText style={styles.title}>
            Generating Your Wallet
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Please wait while we securely generate your wallet...
          </ThemedText>
        </View>
      </OnboardingContainer>
    )
  }
  
  // Show error state if wallet generation failed
  if (walletError) {
    return (
      <OnboardingContainer>
        <BackButton onPress={handleBackWithConfirmation} />
        <View style={styles.content}>
          <ThemedText style={styles.title}>
            Wallet Generation Failed
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {walletError}
          </ThemedText>
          <OnboardingButton
            label="Try Again"
            onPress={setupWallet}
            style={styles.confirmButton}
          />
        </View>
      </OnboardingContainer>
    )
  }
  
  return (
    <OnboardingContainer>
      <BackButton onPress={handleBackWithConfirmation} />
      
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
              seedPhrase={seedPhraseWords} 
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
