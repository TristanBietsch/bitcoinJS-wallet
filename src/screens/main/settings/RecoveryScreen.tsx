import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { Key, AlertTriangle, Eye, EyeOff } from 'lucide-react-native'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { ThemedText } from '@/src/components/ui/Text'
import SeedPhraseDisplay from '@/src/components/features/Wallet/SeedPhrase/SeedPhraseDisplay'
import CopyButton from '@/src/components/ui/Button/CopyButton'
import PrimaryActionButton from '@/src/components/ui/Button/PrimaryActionButton'
import { useCopyToClipboard } from '@/src/hooks/ui/useCopyToClipboard'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'
import WalletService from '@/src/services/bitcoin/wallet'
import { Colors } from '@/src/constants/colors'

const RecoveryScreen = () => {
  const { handleClose } = useMenuNavigation()
  const { copyStatus, copyToClipboard } = useCopyToClipboard()
  
  const [ seedPhrase, setSeedPhrase ] = useState<string | null>(null)
  const [ seedWords, setSeedWords ] = useState<string[]>([])
  const [ isVisible, setIsVisible ] = useState(false)
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)

  useEffect(() => {
    loadSeedPhrase()
  }, [])

  const loadSeedPhrase = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const phrase = await WalletService.getSeedPhrase()
      if (phrase) {
        setSeedPhrase(phrase)
        setSeedWords(phrase.split(' '))
      } else {
        setError('No recovery phrase found. Please ensure your wallet is properly set up.')
      }
    } catch (err) {
      console.error('Failed to load seed phrase:', err)
      setError('Failed to load recovery phrase. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!seedPhrase) return
    
    try {
      await copyToClipboard(seedPhrase)
    } catch (error) {
      console.error('Failed to copy recovery phrase:', error)
      Alert.alert('Error', 'Failed to copy recovery phrase to clipboard')
    }
  }

  const handleRevealPhrase = () => {
    if (!isVisible) {
      // Show security warning before revealing
      Alert.alert(
        'Security Warning',
        'Your recovery phrase is the key to your wallet. Never share it with anyone and ensure you\'re in a private location.',
        [
          {
            text  : 'Cancel',
            style : 'cancel'
          },
          {
            text    : 'I Understand',
            onPress : () => setIsVisible(true)
          }
        ]
      )
    } else {
      setIsVisible(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.loadingText}>Loading recovery phrase...</ThemedText>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <AlertTriangle size={48} color={Colors.light.errorRed} style={styles.errorIcon} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <PrimaryActionButton
            label="Try Again"
            onPress={loadSeedPhrase}
            style={styles.retryButton}
          />
        </View>
      )
    }

    if (!seedPhrase) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>No recovery phrase available</ThemedText>
        </View>
      )
    }

    return (
      <View style={styles.contentContainer}>
        {/* Header */}
                 <View style={styles.header}>
           <Key size={32} color={Colors.light.electricBlue} />
           <ThemedText style={styles.title}>Recovery Phrase</ThemedText>
           <ThemedText style={styles.subtitle}>
             Your {seedWords.length}-word recovery phrase. Keep it safe and private.
           </ThemedText>
         </View>

         {/* Security Warning */}
         <View style={styles.warningContainer}>
           <AlertTriangle size={20} color={Colors.light.buttons.warning} />
           <ThemedText style={styles.warningText}>
             Never share your recovery phrase with anyone. It provides full access to your wallet.
           </ThemedText>
         </View>

        {/* Seed Phrase Display */}
        <View style={styles.seedPhraseContainer}>
          {isVisible ? (
            <SeedPhraseDisplay 
              seedPhrase={seedWords}
              columns={2}
              startFromOne={true}
            />
          ) : (
            <TouchableOpacity 
              style={styles.hiddenContainer}
              onPress={handleRevealPhrase}
              activeOpacity={0.7}
            >
              <Eye size={48} color={Colors.light.textSecondary} />
              <ThemedText style={styles.hiddenText}>
                Tap "Reveal Phrase" to view your recovery words
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryActionButton
            label={isVisible ? "Hide Phrase" : "Reveal Phrase"}
            onPress={handleRevealPhrase}
            style={isVisible ? styles.actionButton : [ styles.actionButton, styles.revealButton ]}
            icon={isVisible ? <EyeOff size={20} color="white" /> : <Eye size={20} color="white" />}
          />

          {isVisible && (
            <CopyButton
              onPress={handleCopyToClipboard}
              copied={copyStatus === 'copied'}
              style={styles.copyButton}
              showLabel={true}
              label="Copy Phrase"
              iconColor="white"
            />
          )}
        </View>
      </View>
    )
  }

  return (
    <SimpleScreenLayout 
      title="Recovery Phrase"
      onBackPress={handleClose}
    >
      {renderContent()}
    </SimpleScreenLayout>
  )
}

const styles = StyleSheet.create({
  contentContainer : {
    flex              : 1,
    paddingHorizontal : 20,
    paddingTop        : 20,
  },
  centerContainer : {
    flex              : 1,
    justifyContent    : 'center',
    alignItems        : 'center',
    paddingHorizontal : 20,
  },
  header : {
    alignItems   : 'center',
    marginBottom : 30,
  },
  title : {
    fontSize     : 24,
    fontWeight   : 'bold',
    marginTop    : 12,
    marginBottom : 8,
    textAlign    : 'center',
  },
  subtitle : {
    fontSize   : 16,
    color      : Colors.light.textSecondary,
    textAlign  : 'center',
    lineHeight : 22,
  },
  warningContainer : {
    flexDirection   : 'row',
    alignItems      : 'flex-start',
    backgroundColor : Colors.light.warningBackground,
    padding         : 16,
    borderRadius    : 12,
    marginBottom    : 30,
    gap             : 12,
  },
  warningText : {
    flex       : 1,
    fontSize   : 14,
    color      : Colors.light.warning,
    lineHeight : 20,
  },
  seedPhraseContainer : {
    flex            : 1,
    backgroundColor : Colors.light.cardBackground,
    borderRadius    : 16,
    padding         : 20,
    marginBottom    : 20,
    minHeight       : 200,
  },
  hiddenContainer : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
    gap            : 16,
  },
  hiddenText : {
    fontSize   : 16,
    color      : Colors.light.textSecondary,
    textAlign  : 'center',
    lineHeight : 22,
  },
  buttonContainer : {
    gap           : 12,
    paddingBottom : 20,
  },
  actionButton : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
    gap            : 8,
  },
  revealButton : {
    backgroundColor : Colors.light.primary,
  },
  copyButton : {
    backgroundColor   : Colors.light.success,
    paddingVertical   : 16,
    paddingHorizontal : 24,
    borderRadius      : 12,
  },
  loadingText : {
    fontSize : 16,
    color    : Colors.light.textSecondary,
  },
  errorIcon : {
    marginBottom : 16,
  },
  errorText : {
    fontSize     : 16,
    color        : Colors.light.error,
    textAlign    : 'center',
    marginBottom : 20,
    lineHeight   : 22,
  },
  retryButton : {
    backgroundColor   : Colors.light.primary,
    paddingHorizontal : 24,
  },
})

export default RecoveryScreen
