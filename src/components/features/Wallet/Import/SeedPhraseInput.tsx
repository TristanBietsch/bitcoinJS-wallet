import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { secureSeedPhraseInputOptions } from '@/src/utils/security/seedPhraseProtection'
import { WordValidation } from '@/src/hooks/wallet/useSeedPhraseValidation'

interface SeedPhraseInputProps {
  value: string
  onChangeText: (text: string) => void
  wordValidations: WordValidation[]
  isValid: boolean
  showValidation: boolean
}

/**
 * Secure input component for seed phrases
 * Word chips visual display has been removed while maintaining validation logic
 */
const SeedPhraseInput: React.FC<SeedPhraseInputProps> = ({
  value,
  onChangeText,
  // These props are still received but not used visually
  wordValidations: _wordValidations,
  isValid: _isValid,
  showValidation: _showValidation
}) => {
  return (
    <View style={styles.inputContainer}>
      {/* Text input for typing with secure options */}
      <TextInput
        style={[
          styles.input,
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
  }
})

export default SeedPhraseInput 