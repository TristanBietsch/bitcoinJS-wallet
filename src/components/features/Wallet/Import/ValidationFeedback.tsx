import React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { Check } from 'lucide-react-native'
import { ValidationResult } from '@/src/hooks/wallet/useSeedPhraseValidation'

interface ValidationFeedbackProps {
  validationResult: ValidationResult
  showValidation: boolean
  suggestionText: string
  successAnim: Animated.Value
}

/**
 * Component to display validation feedback for seed phrases
 */
const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validationResult,
  showValidation,
  suggestionText,
  successAnim
}) => {
  if (!showValidation) {
    return null
  }

  return (
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
  )
}

const styles = StyleSheet.create({
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
})

export default ValidationFeedback 