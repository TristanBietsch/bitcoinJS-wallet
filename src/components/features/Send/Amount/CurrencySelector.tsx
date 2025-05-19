import React from 'react'
import { View, StyleSheet } from 'react-native'
import Dropdown from '@/src/components/ui/Dropdown'
import { CurrencyType, CURRENCY_OPTIONS } from '@/src/config/currency'
import { Colors } from '@/src/constants/colors'

interface CurrencySelectorProps {
  currency: CurrencyType
  onCurrencyChange: (currency: string) => void
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currency,
  onCurrencyChange
}) => {
  return (
    <View style={styles.currencyToggleContainer}>
      <Dropdown
        options={CURRENCY_OPTIONS}
        selectedValue={currency}
        onSelect={onCurrencyChange}
        placeholder="Select Currency"
        backgroundColor={Colors.light.buttons.primary}
      />
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