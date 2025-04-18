import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { fonts } from '@/src/constants/fonts'

interface AddressDisplayProps {
  address: string
  showLabel?: boolean
  label?: string
  style?: ViewStyle
}

/**
 * Component to display a Bitcoin address with optional label
 */
const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  showLabel = false,
  label = 'on-chain address:',
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      {showLabel && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      <ThemedText style={styles.address}>{address}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width             : '100%',
    alignItems        : 'center',
    paddingVertical   : 4,
    marginTop         : 10,
    paddingHorizontal : 16
  },
  label : {
    fontSize     : 14,
    color        : '#666',
    marginBottom : 4,
    textAlign    : 'center'
  },
  address : {
    fontSize      : 14,
    color         : '#666',
    textAlign     : 'center',
    fontFamily    : fonts.monospace,
    letterSpacing : -0.3
  }
})

export default AddressDisplay 