import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface RequestAmountDisplayProps {
  satsAmount: string
  usdAmount: string
  headerText?: string
}

/**
 * Component for displaying a requested Bitcoin amount in multiple currencies
 */
const RequestAmountDisplay = ({
  satsAmount,
  usdAmount,
  headerText = 'Requesting Amount:'
}: RequestAmountDisplayProps) => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.headerText}>{headerText}</ThemedText>
      <View style={styles.amountContainer}>
        <ThemedText style={styles.amountText}>
          {satsAmount} <ThemedText style={styles.currencyText}>SATS</ThemedText>
        </ThemedText>
        <ThemedText style={styles.usdText}>
          ~${usdAmount}
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems : 'center',
    width      : '100%',
  },
  headerText : {
    fontSize     : 16,
    color        : 'gray',
    marginBottom : 8,
  },
  amountContainer : {
    alignItems   : 'center',
    marginBottom : 32,
  },
  amountText : {
    fontSize     : 48,
    fontWeight   : 'bold',
    color        : 'black',
    marginBottom : 4,
  },
  currencyText : {
    fontSize : 32,
    color    : 'gray',
  },
  usdText : {
    fontSize : 16,
    color    : 'gray',
  }
})

export default RequestAmountDisplay 