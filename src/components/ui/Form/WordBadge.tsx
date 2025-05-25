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
 * Displays a word with neutral styling (removed error indicators)
 */
const WordBadge: React.FC<WordBadgeProps> = ({ wordValidation, index }) => {
  // Add slight position offset based on index for a small staggered effect
  const position = index % 2 === 0 ? 0 : 2
  
  return (
    <View 
      style={[ 
        styles.wordBadge,
        { marginTop: position }
      ]}
      accessibilityLabel={`Word ${index + 1}: ${wordValidation.word}`}
    >
      <ThemedText style={styles.wordText}>
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
    backgroundColor   : Colors.light.offWhite,
    borderWidth       : 1,
    borderColor       : Colors.light.buttons.primary,
  },
  wordText : {
    color    : '#333333',
    fontSize : 14,
  }
})

export default WordBadge 