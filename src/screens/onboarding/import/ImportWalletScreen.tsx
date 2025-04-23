import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native'
import { OnboardingContainer, OnboardingTitle } from '@/src/components/ui/OnboardingScreen'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { validateSeedPhraseWithDetails } from '@/src/utils/validation/seedPhraseValidation'
import { validationMessages } from '@/src/constants/validationMessages'
import { normalizeMnemonic } from '@/src/constants/validationMessages'
import { isWordInWordlist, getWordlistSuggestion } from '@/src/utils/validation'
import { Check } from 'lucide-react-native'

interface ImportWalletScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface WordValidation {
  word: string;
  isValid: boolean;
  suggestion?: string;
}

const WordBadge = ({ 
  wordValidation,
  index 
}: { 
  wordValidation: WordValidation; 
  index: number 
}) => {
  // Style based on word validity
  const badgeStyle = wordValidation.isValid 
    ? styles.validWordBadge 
    : styles.invalidWordBadge
  
  const textStyle = wordValidation.isValid 
    ? styles.validWordText 
    : styles.invalidWordText
  
  // Add slight position offset based on index for a small staggered effect
  const position = index % 2 === 0 ? 0 : 2
  
  return (
    <View 
      style={[ 
        styles.wordBadge, 
        badgeStyle,
        { marginTop: position }
      ]}
      accessibilityLabel={`Word ${index + 1}: ${wordValidation.word}`}
    >
      <ThemedText style={textStyle}>
        {wordValidation.word}
      </ThemedText>
    </View>
  )
}

export default function ImportWalletScreen({ onComplete, onBack }: ImportWalletScreenProps) {
  const [ seedPhrase, setSeedPhrase ] = useState('')
  const [ validationResult, setValidationResult ] = useState<{
    isValid      : boolean;
    errorMessage : string;
    wordCount    : number;
  }>({
    isValid      : false,
    errorMessage : '',
    wordCount    : 0
  })
  const [ showValidation, setShowValidation ] = useState(false)
  const [ wordValidations, setWordValidations ] = useState<WordValidation[]>([])
  const [ successAnim ] = useState(new Animated.Value(0))
  
  // Word-by-word validation
  useEffect(() => {
    if (!seedPhrase.trim()) {
      setWordValidations([])
      return
    }
    
    const normalizedPhrase = normalizeMnemonic(seedPhrase)
    const words = normalizedPhrase.split(' ').filter(Boolean)
    
    const validations = words.map(word => {
      const isValid = isWordInWordlist(word)
      const suggestion = isValid ? undefined : getWordlistSuggestion(word)
      
      return {
        word,
        isValid,
        suggestion
      }
    })
    
    setWordValidations(validations)
  }, [ seedPhrase ])

  // Full seed phrase validation
  useEffect(() => {
    if (!seedPhrase.trim()) {
      setValidationResult({
        isValid      : false,
        errorMessage : validationMessages.seedPhrase.empty,
        wordCount    : 0
      })
      return
    }

    const normalizedPhrase = normalizeMnemonic(seedPhrase)
    const words = normalizedPhrase.split(' ').filter(Boolean)
    const wordCount = words.length
    
    // Only perform full validation if we have enough words
    if (wordCount >= 3) {
      const result = validateSeedPhraseWithDetails(normalizedPhrase)
      setValidationResult({
        isValid      : result.isValid,
        errorMessage : result.errorMessage,
        wordCount
      })
      
      // Animate success state when valid
      if (result.isValid) {
        Animated.sequence([
          Animated.timing(successAnim, {
            toValue         : 1,
            duration        : 300,
            useNativeDriver : true
          }),
          Animated.timing(successAnim, {
            toValue         : 0.8,
            duration        : 200,
            useNativeDriver : true
          }),
          Animated.timing(successAnim, {
            toValue         : 1,
            duration        : 200,
            useNativeDriver : true
          })
        ]).start()
      }
    } else {
      // For partial input, just count words
      setValidationResult({
        isValid      : false,
        errorMessage : validationMessages.seedPhrase.incorrectWordCount(wordCount),
        wordCount
      })
    }
  }, [ seedPhrase ])

  const handleSeedPhraseChange = (text: string) => {
    // Prevent entering more than 24 words
    const normalizedText = normalizeMnemonic(text)
    const words = normalizedText.split(' ').filter(Boolean)
    
    if (words.length > 24) {
      // Limit to first 24 words
      const limitedWords = words.slice(0, 24)
      const limitedText = limitedWords.join(' ')
      setSeedPhrase(limitedText)
      
      // Show validation and notify about the limit
      setShowValidation(true)
      setValidationResult(prevState => ({
        ...prevState,
        errorMessage : 'Maximum 24 words allowed. Input has been trimmed.'
      }))
      return
    }
    
    setSeedPhrase(text)
    // Show validation feedback once the user has typed something
    if (!showValidation && text.trim()) {
      setShowValidation(true)
    }
  }

  const handleImport = () => {
    // Only proceed if the seed phrase is valid
    if (validationResult.isValid) {
      onComplete()
    } else {
      // Force show validation if user tries to submit invalid phrase
      setShowValidation(true)
    }
  }

  // Determine button state
  const isButtonEnabled = validationResult.isValid
  const buttonOpacity = isButtonEnabled ? 1 : 0.5
  
  // Get specific error suggestions if there are invalid words
  const invalidWords = wordValidations.filter(v => !v.isValid)
  let suggestionText = ''
  
  if (invalidWords.length === 1 && invalidWords[0].suggestion) {
    suggestionText = `Did you mean "${invalidWords[0].suggestion}" instead of "${invalidWords[0].word}"?`
  } else if (invalidWords.length > 0) {
    suggestionText = 'Check the highlighted words for errors.'
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
          {/* Visual word display with validation */}
          {wordValidations.length > 0 && (
            <ScrollView 
              horizontal={false} 
              style={styles.wordsContainer}
              contentContainerStyle={styles.wordsContentContainer}
            >
              <View style={styles.wordBadgesContainer}>
                {wordValidations.map((validation, index) => (
                  <WordBadge 
                    key={`word-${index}`} 
                    wordValidation={validation} 
                    index={index} 
                  />
                ))}
              </View>
            </ScrollView>
          )}
          
          {/* Text input for typing */}
          <TextInput
            style={[
              styles.input,
              showValidation && !validationResult.isValid && styles.inputError
            ]}
            multiline
            numberOfLines={6}
            placeholder="Enter seed phrase..."
            placeholderTextColor="#BBBBBB"
            value={seedPhrase}
            onChangeText={handleSeedPhraseChange}
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={true}
          />
          
          {showValidation && (
            <View style={styles.validationContainer}>
              {validationResult.isValid ? (
                <Animated.View 
                  style={[
                    styles.successContainer,
                    { transform: [ { scale: successAnim } ] }
                  ]}
                >
                  <Check size={16} color={Colors.light.successGreen} />
                  <ThemedText style={styles.validText}>
                    Valid seed phrase
                  </ThemedText>
                </Animated.View>
              ) : (
                <View>
                  <ThemedText style={styles.errorText}>
                    {validationResult.errorMessage}
                  </ThemedText>
                  {suggestionText ? (
                    <ThemedText style={styles.suggestionText}>
                      {suggestionText}
                    </ThemedText>
                  ) : null}
                </View>
              )}
              
              <ThemedText style={[
                styles.wordCountText,
                validationResult.wordCount === 12 || validationResult.wordCount === 24 
                  ? styles.validText 
                  : styles.warningText
              ]}>
                Words: {validationResult.wordCount}/12 or {validationResult.wordCount}/24
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button,
            { opacity: buttonOpacity }
          ]}
          onPress={handleImport}
          disabled={!isButtonEnabled}
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
  wordsContainer : {
    maxHeight    : 100,
    marginBottom : 10,
    width        : '100%',
  },
  wordsContentContainer : {
    flexGrow        : 1,
    paddingVertical : 8,
  },
  wordBadgesContainer : {
    flexDirection : 'row',
    flexWrap      : 'wrap',
    alignItems    : 'flex-start',
  },
  wordBadge : {
    paddingHorizontal : 10,
    paddingVertical   : 6,
    borderRadius      : 16,
    margin            : 4,
    marginBottom      : 6,
  },
  validWordBadge : {
    backgroundColor : Colors.light.offWhite,
    borderWidth     : 1,
    borderColor     : Colors.light.successGreen,
  },
  invalidWordBadge : {
    backgroundColor : Colors.light.offWhite,
    borderWidth     : 1,
    borderColor     : Colors.light.errorRed,
  },
  validWordText : {
    color    : Colors.light.successGreen,
    fontSize : 14,
  },
  invalidWordText : {
    color    : Colors.light.errorRed,
    fontSize : 14,
  },
  input : {
    backgroundColor : '#F5F5F5',
    borderRadius    : 12,
    padding         : 16,
    minHeight       : 160,
    width           : '100%',
    fontSize        : 16,
    color           : '#333333',
    borderWidth     : 1,
    borderColor     : 'transparent',
  },
  inputError : {
    borderColor : Colors.light.errorRed,
    borderWidth : 1,
  },
  validationContainer : {
    marginTop    : 8,
    marginBottom : 16,
    width        : '100%',
  },
  successContainer : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 4,
  },
  errorText : {
    color        : Colors.light.errorRed,
    fontSize     : 14,
    marginBottom : 4,
  },
  suggestionText : {
    color        : Colors.light.buttons.primary,
    fontSize     : 14,
    marginBottom : 8,
  },
  validText : {
    color        : Colors.light.successGreen,
    fontSize     : 14,
    marginBottom : 4,
    marginLeft   : 4,
  },
  warningText : {
    color    : Colors.light.buttons.warning,
    fontSize : 14,
  },
  wordCountText : {
    fontSize : 14,
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
  buttonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 16,
    fontWeight : 'bold',
  }
}) 