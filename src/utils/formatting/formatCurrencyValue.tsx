import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { CurrencyType } from '@/src/types/domain/finance'

/**
 * Formats a currency amount with the specified currency symbol
 * @param amount The amount to format
 * @param currencySymbol The currency symbol to use (defaults to $)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencyType: string = 'USD'): string => {
  let currencySymbol = '$'
  
  if (currencyType === 'BTC') {
    currencySymbol = 'BTC'
  }
  
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
  
  if (currency === 'USD') {
    return <ThemedText style={styles.value}>${amount.toFixed(2)}</ThemedText>
  }
  
  return <ThemedText style={styles.value}>{amount.toFixed(8)} {currency}</ThemedText>
}

/**
 * Formats the total amount with USD equivalent in subtext
 * @param amount The main amount to display
 * @param currency The currency type of the main amount
 * @param usdEquivalent The USD equivalent amount
 */
export const formatTotalWithUsdEquivalent = (
  amount: number, 
  currency: CurrencyType,
  usdEquivalent: number
) => {
  return (
    <View style={styles.valueContainer}>
      {formatConfirmationValue(amount, currency)}
      {currency !== 'USD' && (
        <ThemedText style={styles.subtextUsd}>${usdEquivalent.toFixed(2)}</ThemedText>
      )}
    </View>
  )
}

/**
 * Formats Bitcoin amounts with the appropriate number of decimal places
 * BTC shows up to 8 decimal places, trimming trailing zeros
 * SATS shows 0 decimal places, up to 9 digits
 * USD shows 2 decimal places
 * 
 * @param amount The amount to format
 * @param currency The currency type
 * @returns Formatted string
 */
export const formatBitcoinAmount = (amount: string, currency: CurrencyType): string => {
  // For USD, ensure 2 decimal places
  if (currency === 'USD') {
    const num = parseFloat(amount)
    return num.toFixed(2)
  }
  
  // For SATS, show as integer (no decimal places)
  if (currency === 'SATS') {
    // If there's a decimal point, only show the integer part
    if (amount.includes('.')) {
      return amount.split('.')[0]
    }
    
    // Limit to 9 digits maximum
    if (amount.length > 9) {
      return amount.substring(0, 9)
    }
    
    return amount
  }
  
  // For BTC, show up to 8 decimal places without trailing zeros
  const parts = amount.split('.')
  if (parts.length === 1) {
    return amount // No decimal point
  }
  
  const integerPart = parts[0]
  let decimalPart = parts[1]
  
  // Limit to 8 decimal places
  if (decimalPart.length > 8) {
    decimalPart = decimalPart.substring(0, 8)
  }
  
  // Trim trailing zeros
  decimalPart = decimalPart.replace(/0+$/, '')
  
  // Return the formatted amount
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
  subtextUsd : {
    fontSize  : 14,
    color     : '#666',
    marginTop : 4
  }
}) 