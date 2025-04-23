import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { WordValidation } from '@/src/hooks/wallet/useSeedPhraseValidation'

interface WordBadgeProps {
  wordValidation: WordValidation
  index: number
}

/**
 * Displays a word with visual indication of validity (valid/invalid)
 */
const WordBadge: React.FC<WordBadgeProps> = ({ wordValidation, index }) => {
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

const styles = StyleSheet.create({
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
})

export default WordBadge 