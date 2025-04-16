import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface NumberPadProps {
  onNumberPress: (value: string) => void
  onBackspace: () => void
}

const NumberPad: React.FC<NumberPadProps> = ({
  onNumberPress,
  onBackspace
}) => {
  // Render number key
  const renderNumberKey = (value: string) => (
    <TouchableOpacity 
      key={value}
      style={styles.numberKey} 
      onPress={() => value === '⌫' ? onBackspace() : onNumberPress(value)}
    >
      <ThemedText style={styles.numberKeyText}>{value}</ThemedText>
    </TouchableOpacity>
  )
  
  // Number pad keys layout
  const numberPadKeys = [
    [ '1', '2', '3' ],
    [ '4', '5', '6' ],
    [ '7', '8', '9' ],
    [ '.', '0', '⌫' ]
  ]
  
  return (
    <View style={styles.numberPadContainer}>
      {numberPadKeys.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.numberPadRow}>
          {row.map(key => renderNumberKey(key))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  numberPadContainer : {
    paddingHorizontal : 24,
  },
  numberPadRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 24,
  },
  numberKey : {
    width          : 60,
    height         : 60,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  numberKeyText : {
    fontSize : 32,
    color    : 'black',
  },
})

export default NumberPad 