import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface AddressDisplayProps {
  address: string
  label?: string
  style?: ViewStyle
}

/**
 * Component to display a Bitcoin address with label
 */
const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  label = 'on-chain address:',
  style
}) => {
  // Format the address for better readability (truncate if too long)
  const formattedAddress = address.length > 40 
    ? `${address.substring(0, 20)}\n${address.substring(20, 40)}`
    : address

  return (
    <View style={[ styles.container, style ]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.address}>{formattedAddress}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width           : '100%',
    alignItems      : 'center',
    paddingVertical : 8
  },
  label : {
    fontSize     : 14,
    color        : '#666',
    marginBottom : 4,
    textAlign    : 'center'
  },
  address : {
    fontSize   : 14,
    color      : '#333',
    textAlign  : 'center',
    fontFamily : 'monospace'
  }
})

export default AddressDisplay 