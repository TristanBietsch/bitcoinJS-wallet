import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { CurrencyType } from '@/src/hooks/send/useBitcoinPriceConverter'

interface AmountDisplayProps {
  amount: string
  currency: CurrencyType
  balance: string
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  currency,
  balance
}) => {
  // Format displayed amount based on currency
  const getFormattedAmount = () => {
    if (currency === 'USD') {
      return amount.includes('.') ? amount : `${amount}.00`
    }
    return amount
  }

  return (
    <View style={styles.amountContainer}>
      <View style={styles.amountDisplay}>
        <ThemedText style={styles.amountText}>
          {getFormattedAmount()}<ThemedText style={styles.currencyText}>{currency}</ThemedText>
        </ThemedText>
      </View>
      
      <ThemedText style={styles.balanceText}>
        Your balance {balance}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  amountContainer : {
    flex           : 0,
    justifyContent : 'flex-start',
    alignItems     : 'center',
    paddingTop     : 120,
    marginBottom   : 20,
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