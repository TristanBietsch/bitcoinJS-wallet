import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface InvoiceAmountDisplayProps {
  formattedAmount: string
  label?: string
  style?: ViewStyle
}

/**
 * Component for displaying a formatted invoice amount (BTC or SATS)
 */
const InvoiceAmountDisplay: React.FC<InvoiceAmountDisplayProps> = ({
  formattedAmount,
  label = 'Amount:',
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.amountText}>{formattedAmount}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems        : 'center',
    marginTop         : 24,
    marginBottom      : 16,
    width             : '100%',
    paddingHorizontal : 20
  },
  label : {
    fontSize     : 16,
    color        : '#666',
    marginBottom : 12,
    fontWeight   : '500'
  },
  amountText : {
    fontSize   : 32,
    fontWeight : 'bold',
    color      : '#000'
  }
})

export default InvoiceAmountDisplay 