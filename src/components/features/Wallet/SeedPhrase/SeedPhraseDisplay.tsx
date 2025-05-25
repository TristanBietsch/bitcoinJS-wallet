import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface SeedPhraseDisplayProps {
  seedPhrase: string[]
  columns?: number
  startFromOne?: boolean
}

/**
 * Component to display seed phrase words in a multi-column layout
 */
const SeedPhraseDisplay: React.FC<SeedPhraseDisplayProps> = ({
  seedPhrase,
  columns = 2,
  startFromOne = true
}) => {
  // Skip if no seed phrase provided
  if (!seedPhrase || seedPhrase.length === 0) {
    return null
  }
  
  // Calculate how many words per column
  const wordsPerColumn = Math.ceil(seedPhrase.length / columns)
  
  // Create arrays for each column
  const columnArrays = Array.from({ length: columns }, (_, columnIndex) => {
    const startIdx = columnIndex * wordsPerColumn
    return seedPhrase.slice(startIdx, startIdx + wordsPerColumn)
  })
  
  return (
    <View style={styles.seedWordsContainer}>
      {columnArrays.map((columnWords, columnIndex) => (
        <View key={`column-${columnIndex}`} style={styles.column}>
          {columnWords.map((word, wordIndex) => {
            const wordNumber = columnIndex * wordsPerColumn + wordIndex + (startFromOne ? 1 : 0)
            return (
              <View key={`word-${wordNumber}`} style={styles.wordRow}>
                <ThemedText style={styles.wordText}>
                  {wordNumber}. {word}
                </ThemedText>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  seedWordsContainer : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    width          : '100%',
  },
  column : {
    width : '48%',
  },
  wordRow : {
    paddingVertical : 12,
  },
  wordText : {
    fontSize : 16,
  }
})

export default SeedPhraseDisplay 