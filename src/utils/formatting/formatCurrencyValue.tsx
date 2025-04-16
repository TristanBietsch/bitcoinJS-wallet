import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { CurrencyType } from '@/src/types/currency.types'

/**
 * Formats a currency amount with the specified currency symbol
 * @param amount The amount to format
 * @param currencySymbol The currency symbol to use (defaults to $)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
  return `${currencySymbol}${amount.toFixed(2)}`
}

/**
 * Formats currency values for display with proper styling 
 * @param amount The amount to format
 * @param currency The currency type (USD, BTC, or SATS)
 */
export const formatConfirmationValue = (amount: number, currency: CurrencyType) => {
  if (currency === 'SATS') {
    const formattedNumber = amount.toLocaleString('en-US', {
      minimumFractionDigits : 0,
      maximumFractionDigits : 0
    })
    return (
      <View style={styles.satsContainer}>
        <ThemedText style={styles.value}>{formattedNumber}</ThemedText>
        <ThemedText style={styles.satsLabel}>sats</ThemedText>
      </View>
    )
  }
  return <ThemedText style={styles.value}>{formatCurrency(amount, currency)}</ThemedText>
}

const styles = StyleSheet.create({
  satsContainer : {
    flexDirection : 'row',
    alignItems    : 'baseline'
  },
  satsLabel : {
    fontSize   : 12,
    color      : '#666',
    marginLeft : 4
  },
  value : {
    fontSize  : 16,
    color     : '#000',
    textAlign : 'right'
  }
}) 