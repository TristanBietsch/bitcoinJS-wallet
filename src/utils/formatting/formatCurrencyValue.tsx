import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { CurrencyType } from '@/src/types/domain/finance'

/**
 * Generic number formatter (can be expanded for BTC/SATS specific needs if required)
 * @param amount The amount to format
 * @param currencyType The currency type (BTC or SATS)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencyType: CurrencyType): string => {
  // Basic formatting, can be made more specific for BTC/SATS if needed
  if (currencyType === 'BTC') {
    return `${amount.toFixed(8)} BTC` // Example: Show 8 decimal places for BTC
  }
  // SATS are typically whole numbers
  return `${Math.round(amount)} SATS`
}

/**
 * Formats currency values for display with proper styling for SATS and BTC
 * @param amount The amount to format
 * @param currency The currency type (BTC or SATS)
 */
export const formatConfirmationValue = (amount: number, currency: CurrencyType) => {
  if (currency === 'SATS') {
    const formattedNumber = Math.round(amount).toLocaleString('en-US', {
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
  
  // Default to BTC formatting if not SATS
  return <ThemedText style={styles.value}>{amount.toFixed(8)} {currency}</ThemedText>
}

/**
 * Formats Bitcoin amounts with the appropriate number of decimal places
 * BTC shows up to 8 decimal places, trimming trailing zeros
 * SATS shows 0 decimal places
 * 
 * @param amount The amount to format (as a string)
 * @param currency The currency type (BTC or SATS)
 * @returns Formatted string
 */
export const formatBitcoinAmount = (amount: string, currency: CurrencyType): string => {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return '0' // Or handle error appropriately

  if (currency === 'SATS') {
    return String(Math.round(numAmount))
  }
  
  // For BTC, show up to 8 decimal places, remove trailing zeros.
  // toFixed(8) ensures we have enough precision before trimming.
  const btcFormatted = numAmount.toFixed(8)
  const parts = btcFormatted.split('.')
  const integerPart = parts[0]
  let decimalPart = parts[1] || ''

  decimalPart = decimalPart.replace(/0+$/, '') // Trim trailing zeros from decimal part

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
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
  },
  valueContainer : {
    alignItems : 'flex-end'
  },
  // subtextUsd style removed as it is no longer needed
}) 