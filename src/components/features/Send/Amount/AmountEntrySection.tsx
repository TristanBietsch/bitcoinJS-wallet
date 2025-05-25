import React from 'react'
import { View, StyleSheet } from 'react-native'
import { AmountDisplay } from '@/src/components/features/Send/Address/AmountDisplay'
import { CurrencySelector } from '@/src/components/features/Send/Amount'
import { CurrencyType } from '@/src/types/domain/finance'

interface AmountEntrySectionProps {
  amount: string
  currency: CurrencyType
  balance?: string
  isLoading?: boolean
  onCurrencyChange: (currency: string) => void
}

/**
 * A component that combines amount display and currency selection
 */
const AmountEntrySection: React.FC<AmountEntrySectionProps> = ({
  amount,
  currency,
  onCurrencyChange
}) => {
  return (
    <View style={styles.container}>
      {/* Amount Display */}
      <AmountDisplay
        amount={amount}
        currency={currency}
      />
      
      {/* Currency Selector */}
      <View style={styles.currencySelectorContainer}>
        <CurrencySelector
          currency={currency}
          onCurrencyChange={onCurrencyChange}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems     : 'center',
    justifyContent : 'center',
    marginTop      : 20,
    width          : '100%',
  },
  currencySelectorContainer : {
    alignItems     : 'center',
    justifyContent : 'center',
    width          : '100%',
    marginTop      : 4,
  }
})

export default AmountEntrySection 