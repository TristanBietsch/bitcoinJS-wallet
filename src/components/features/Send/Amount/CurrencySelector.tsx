import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import Dropdown from '@/src/components/ui/Dropdown'
import { CurrencyType } from '@/src/hooks/send/useBitcoinPriceConverter'

// Currency options for the dropdown
const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'BTC', value: 'BTC' },
  { label: 'SATS', value: 'SATS' },
]

interface CurrencySelectorProps {
  currency: CurrencyType
  isLoading: boolean
  onCurrencyChange: (currency: string) => void
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currency,
  isLoading,
  onCurrencyChange
}) => {
  return (
    <View style={styles.currencyToggleContainer}>
      {isLoading ? (
        <ActivityIndicator size="small" color="red" />
      ) : (
        <Dropdown
          options={CURRENCY_OPTIONS}
          selectedValue={currency}
          onSelect={onCurrencyChange}
          placeholder="Select Currency"
          backgroundColor="red"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  currencyToggleContainer : {
    marginVertical : 12,
    width          : 150,
    height         : 36,
    justifyContent : 'center',
  },
}) 