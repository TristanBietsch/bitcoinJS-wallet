import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface InvoiceAmountDisplayProps {
  satsAmount: string
  usdAmount: string
  label?: string
  style?: ViewStyle
}

/**
 * Component for displaying an invoice amount with both SATS and USD values
 */
const InvoiceAmountDisplay: React.FC<InvoiceAmountDisplayProps> = ({
  satsAmount,
  usdAmount,
  label = 'Requesting Amount:',
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.amount}>
        {satsAmount} <ThemedText style={styles.unit}>Sats</ThemedText>
      </ThemedText>
      <ThemedText style={styles.usdAmount}>≈ ${usdAmount} USD</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems   : 'center',
    marginBottom : 20,
    width        : '100%'
  },
  label : {
    fontSize     : 14,
    color        : '#666',
    marginBottom : 8
  },
  amount : {
    fontSize     : 28,
    fontWeight   : 'bold',
    marginBottom : 4
  },
  unit : {
    fontSize   : 28,
    fontWeight : 'bold'
  },
  usdAmount : {
    fontSize : 14,
    color    : '#666'
  }
})

export default InvoiceAmountDisplay 