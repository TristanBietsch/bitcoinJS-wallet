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
      <View style={styles.amountWrapper}>
        <ThemedText style={styles.amount}>
          {satsAmount}
        </ThemedText>
        <ThemedText style={styles.unit}>Sats</ThemedText>
      </View>
      <ThemedText style={styles.usdAmount}>≈ ${usdAmount} USD</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems        : 'center',
    marginTop         : 56,
    marginBottom      : 8,
    width             : '100%',
    paddingHorizontal : 20
  },
  label : {
    fontSize     : 16,
    color        : '#666',
    marginBottom : 12,
    fontWeight   : '500'
  },
  amountWrapper : {
    flexDirection : 'row',
    alignItems    : 'baseline',
    marginBottom  : 8
  },
  amount : {
    fontSize    : 36,
    fontWeight  : 'bold',
    marginRight : 6
  },
  unit : {
    fontSize   : 24,
    fontWeight : '600',
    color      : '#444',
    marginLeft : 2
  },
  usdAmount : {
    fontSize   : 16,
    color      : '#666',
    marginTop  : 4,
    fontWeight : '500'
  }
})

export default InvoiceAmountDisplay 