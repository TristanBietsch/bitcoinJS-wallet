import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { CurrencyType } from '@/src/types/domain/finance'

interface AmountDisplayProps {
  amount: string
  currency: CurrencyType
  balance?: string
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  currency,
}) => {
  // Amount is already formatted by the hook, so just display it
  return (
    <View style={styles.amountContainer}>
      <View style={styles.amountDisplay}>
        <ThemedText style={styles.amountText}>
          {amount} <ThemedText style={styles.currencyText}>{currency}</ThemedText>
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  amountContainer : {
    flex           : 0,
    justifyContent : 'flex-start',
    alignItems     : 'center',
    paddingTop     : 20,
    marginBottom   : 10,
  },
  amountDisplay : { 
    marginBottom : 4,
  },
  amountText : {
    fontSize   : 48,
    fontWeight : 'bold',
    color      : 'black',
  },
  currencyText : {
    fontSize   : 32,
    color      : 'gray',
    marginLeft : 4,
  },
  balanceText : {
    fontSize     : 14,
    color        : 'gray',
    marginBottom : 0,
  },
}) 