import React from 'react'
import { View, TextInput, ScrollView, StyleSheet } from 'react-native'
import { Colors } from '@/src/constants/colors'
import { secureSeedPhraseInputOptions } from '@/src/utils/security/seedPhraseProtection'
import WordBadge from '@/src/components/ui/Form/WordBadge'
import { WordValidation } from '@/src/hooks/wallet/useSeedPhraseValidation'

interface SeedPhraseInputProps {
  value: string
  onChangeText: (text: string) => void
  wordValidations: WordValidation[]
  isValid: boolean
  showValidation: boolean
}

/**
 * Secure input component for seed phrases with word validation display
 */
const SeedPhraseInput: React.FC<SeedPhraseInputProps> = ({
  value,
  onChangeText,
  wordValidations,
  isValid,
  showValidation
}) => {
  return (
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
      
      {/* Text input for typing with secure options */}
      <TextInput
        style={[
          styles.input,
          showValidation && !isValid && styles.inputError,
          secureSeedPhraseInputOptions.style
        ]}
        multiline
        numberOfLines={6}
        placeholder="Enter seed phrase..."
        placeholderTextColor="#BBBBBB"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={secureSeedPhraseInputOptions.autoCorrect}
        autoComplete={secureSeedPhraseInputOptions.autoComplete}
        autoCapitalize={secureSeedPhraseInputOptions.autoCapitalize}
        secureTextEntry={secureSeedPhraseInputOptions.secureTextEntry}
        spellCheck={secureSeedPhraseInputOptions.spellCheck}
        selectTextOnFocus={secureSeedPhraseInputOptions.selectTextOnFocus}
        keyboardType={secureSeedPhraseInputOptions.keyboardType}
        textAlignVertical="top"
        returnKeyType="done"
        blurOnSubmit={true}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer : {
    width : '100%',
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
})

export default SeedPhraseInput 