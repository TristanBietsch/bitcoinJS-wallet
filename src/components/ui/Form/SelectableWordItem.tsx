import React from 'react'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface SelectableWordItemProps {
  word: string
  selectionOrder: number | null
  onSelect: () => void
  disabled?: boolean
}

/**
 * A selectable word item component used in seed phrase verification
 */
const SelectableWordItem: React.FC<SelectableWordItemProps> = ({
  word,
  selectionOrder,
  onSelect,
  disabled = false
}) => {
  const isSelected = selectionOrder !== null
  
  // Check if this is the most recently selected word
  // This would require knowing the max selection order from the parent component
  const isLastSelected = false // This will be determined via props if needed
  
  return (
    <TouchableOpacity
      style={styles.wordItem}
      onPress={onSelect}
      disabled={disabled}
    >
      <ThemedText style={styles.wordText}>
        {word}
      </ThemedText>
      
      {isSelected && (
        <View style={[
          styles.selectionOverlay,
          isLastSelected && styles.lastSelectedOverlay
        ]}>
          <Text style={styles.selectionOrderText}>
            {selectionOrder}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wordItem : {
    backgroundColor   : '#F5F5F5',
    paddingHorizontal : 16,
    paddingVertical   : 12,
    borderRadius      : 16,
    margin            : 6,
    position          : 'relative',
    minWidth          : '28%',
    alignItems        : 'center'
  },
  wordText : {
    fontSize : 16
  },
  selectionOverlay : {
    position        : 'absolute',
    top             : 0,
    left            : 0,
    right           : 0,
    bottom          : 0,
    backgroundColor : 'rgba(0, 0, 0, 0.85)',
    borderRadius    : 16,
    justifyContent  : 'center',
    alignItems      : 'center'
  },
  selectionOrderText : {
    color      : '#FFFFFF',
    fontSize   : 18,
    fontWeight : 'bold'
  },
  lastSelectedOverlay : {
    backgroundColor : 'rgba(0, 0, 0, 0.85)'
  }
})

export default SelectableWordItem 