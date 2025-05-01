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
 * (Visual warnings and texts have been removed while keeping validation logic)
 */
const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validationResult,
  showValidation,
  successAnim
}) => {
  if (!showValidation) {
    return null
  }

  return (
    <View style={styles.validationContainer}>
      {validationResult.isValid && (
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
      )}
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
  validText : {
    color        : Colors.light.successGreen,
    fontSize     : 14,
    marginBottom : 4,
    marginLeft   : 4,
  }
})

export default ValidationFeedback 