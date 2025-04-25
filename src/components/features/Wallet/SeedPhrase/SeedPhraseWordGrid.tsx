import React from 'react'
import { View, StyleSheet } from 'react-native'
import SelectableWordItem from '@/src/components/ui/Form/SelectableWordItem'
import { SelectedWord } from '@/src/hooks/wallet/useSeedPhraseSelection'

interface SeedPhraseWordGridProps {
  words: string[]
  selectedWords: SelectedWord[]
  onWordSelect: (word: string) => void
  maxSelections: number
}

/**
 * Grid component for selecting seed phrase words during verification
 */
const SeedPhraseWordGrid: React.FC<SeedPhraseWordGridProps> = ({
  words,
  selectedWords,
  onWordSelect,
  maxSelections
}) => {
  // Helper function to get the selection order of a word
  const getSelectionOrder = (word: string): number | null => {
    const selected = selectedWords.find(item => item.word === word)
    return selected ? selected.order : null
  }
  
  return (
    <View style={styles.wordsContainer}>
      {words.map((word, index) => {
        const selectionOrder = getSelectionOrder(word)
        const isSelected = selectionOrder !== null
        
        return (
          <SelectableWordItem
            key={`word-${index}`}
            word={word}
            selectionOrder={selectionOrder}
            onSelect={() => onWordSelect(word)}
            disabled={selectedWords.length >= maxSelections && !isSelected}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wordsContainer : {
    flexDirection  : 'row',
    flexWrap       : 'wrap',
    justifyContent : 'center',
    width          : '100%',
    marginBottom   : 20
  }
})

export default SeedPhraseWordGrid 