import React, { useState } from 'react'
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { OnboardingContainer, OnboardingTitle } from '@/src/components/ui/OnboardingScreen'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface ImportWalletScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ImportWalletScreen({ onComplete, onBack }: ImportWalletScreenProps) {
  const [ seedPhrase, setSeedPhrase ] = useState('')

  const handleImport = () => {
    // In a real implementation, we would validate the seed phrase here
    onComplete()
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
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={6}
            placeholder="Enter seed phrase..."
            placeholderTextColor="#BBBBBB"
            value={seedPhrase}
            onChangeText={setSeedPhrase}
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button,
            !seedPhrase.trim() && styles.buttonDisabled
          ]}
          onPress={handleImport}
          disabled={!seedPhrase.trim()}
        >
          <ThemedText style={styles.buttonText}>
            Import
          </ThemedText>
        </TouchableOpacity>
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
  input : {
    backgroundColor : '#F5F5F5',
    borderRadius    : 12,
    padding         : 16,
    minHeight       : 160,
    width           : '100%',
    fontSize        : 16,
    color           : '#333333',
  },
  buttonContainer : {
    width             : '100%',
    paddingHorizontal : 20,
    marginBottom      : 40,
  },
  button : {
    backgroundColor : Colors.light.buttons.primary,
    width           : '100%',
    borderRadius    : 30,
    paddingVertical : 16,
    alignItems      : 'center',
  },
  buttonDisabled : {
    opacity : 0.5,
  },
  buttonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 16,
    fontWeight : 'bold',
  }
}) 