import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import Dropdown from '@/src/components/ui/Dropdown'
import { CurrencyType } from '@/src/types/currency.types'
import { CURRENCY_OPTIONS } from '@/src/constants/currency'
import { formatAmount } from '@/src/utils/currency/conversion'

interface AmountDisplayProps {
  amount: string
  currency: CurrencyType
  balance?: string
  isLoading?: boolean
  onCurrencyChange: (currency: string) => void
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  currency,
  balance,
  isLoading = false,
  onCurrencyChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Amount Display */}
      <View style={styles.amountDisplay}>
        <ThemedText style={styles.amountText}>
          {formatAmount(amount, currency)}
          <ThemedText style={styles.currencyText}>{currency}</ThemedText>
        </ThemedText>
      </View>
      
      {/* Balance (if provided) */}
      {balance && (
        <ThemedText style={styles.balanceText}>
          Your balance {balance}
        </ThemedText>
      )}
      
      {/* Currency Toggle */}
      <View style={styles.currencyToggleContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color="red" />
        ) : (
          <Dropdown
            options={CURRENCY_OPTIONS}
            selectedValue={currency}
            onSelect={onCurrencyChange}
            title="Select Currency"
            cancelButtonLabel="Cancel"
            backgroundColor="red"
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    justifyContent : 'flex-start',
    alignItems     : 'center',
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
  currencyToggleContainer : {
    marginVertical : 12,
    width          : 150,
    height         : 36,
    justifyContent : 'center',
  },
})

export default AmountDisplay 