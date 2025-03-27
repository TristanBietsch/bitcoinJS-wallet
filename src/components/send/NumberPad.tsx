import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ThemedText'

interface NumberPadProps {
  onNumberPress: (num: string) => void
}

export const NumberPad: React.FC<NumberPadProps> = ({ onNumberPress }) => {
  const numberPadKeys = [
    [ '1', '2', '3' ],
    [ '4', '5', '6' ],
    [ '7', '8', '9' ],
    [ '.', '0', '⌫' ]
  ]

  const renderNumberKey = (value: string) => (
    <TouchableOpacity 
      key={value}
      style={styles.numberKey} 
      onPress={() => onNumberPress(value)}
    >
      <ThemedText style={styles.numberKeyText}>{value}</ThemedText>
    </TouchableOpacity>
  )

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
    marginBottom      : 0
  },
  numberPadRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 32
  },
  numberKey : {
    width          : 60,
    height         : 60,
    justifyContent : 'center',
    alignItems     : 'center'
  },
  numberKeyText : {
    fontSize : 32,
    color    : 'black'
  }
}) 