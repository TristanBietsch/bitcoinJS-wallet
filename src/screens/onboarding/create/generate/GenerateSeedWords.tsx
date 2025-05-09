import React, { useEffect, useMemo, useState } from 'react'
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
  handleSeedPhraseBack,
  trackSeedPhraseReveal,
} from '@/src/handlers/wallet/seedPhraseHandlers'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { keyManagement } from '@/src/services/bitcoin/wallet/keyManagement'
import { BITCOIN_NETWORK } from '@/src/config/bitcoinNetwork'

interface GenerateSeedWordsProps {
  onComplete: () => void
  onBack: () => void
}

/**
 * Screen for displaying and securing the generated seed phrase
 */
export default function GenerateSeedWords({ onComplete, onBack }: GenerateSeedWordsProps) {
  // State for wallet information
  const [ isGenerating, setIsGenerating ] = useState(true)
  const [ walletError, setWalletError ] = useState<string | null>(null)
  
  // Generate cryptographically secure seed phrase using our service
  const seedPhrase = useMemo(() => {
    return seedPhraseService.generateSeedPhrase(12)
  }, [])
  
  // Convert seedPhrase to array of words for display
  const seedPhraseWords = useMemo(() => {
    return seedPhraseService.getWords(seedPhrase)
  }, [ seedPhrase ])
  
  // Generate Bitcoin keys from the seed phrase
  useEffect(() => {
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
    
    setupWallet()
  }, [ seedPhrase ])
  
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
  
  // Get back handler
  const handleBack = handleSeedPhraseBack(onBack)
  
  // Show loading state while generating wallet
  if (isGenerating) {
    return (
      <OnboardingContainer>
        <BackButton onPress={handleBack} />
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
        <BackButton onPress={handleBack} />
        <View style={styles.content}>
          <ThemedText style={styles.title}>
            Wallet Generation Failed
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {walletError}
          </ThemedText>
          <OnboardingButton
            label="Try Again"
            onPress={onBack}
            style={styles.confirmButton}
          />
        </View>
      </OnboardingContainer>
    )
  }
  
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
