import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { CurrencyType } from '@/src/types/domain/finance'

/**
 * Generic number formatter that correctly handles the display of BTC and SATS values
 * This is robust and won't break when swapping between currencies
 * 
 * @param amount The amount to format - for BTC input, should be in BTC units; for SATS input, should be in SATS units
 * @param currencyType The currency type (BTC or SATS) to format as
 * @returns Formatted currency string without currency suffix (UI handles that separately)
 */
export const formatCurrency = (amount: number, currencyType: CurrencyType): string => {
  if (amount === 0) return '0'
  
  if (currencyType === 'BTC') {
    // Ensure amount is in BTC (it should already be)
    // No conversion needed here, as we now handle the conversion in the HomeScreen component
    
    // Format BTC with 8 decimal places and thousands separators
    const parts = amount.toFixed(8).split('.')
    const integerPart = parseInt(parts[0]).toLocaleString('en-US')
    const decimalPart = parts[1]
    
    // Combine integer and decimal parts with proper formatting
    return `${integerPart}.${decimalPart}`
  } else { // SATS
    // Amount should already be in SATS as we handle conversion in the HomeScreen component
    
    // Format SATS as whole numbers with thousand separators
    const satsValue = Math.round(amount)
    return satsValue.toLocaleString('en-US', {
      maximumFractionDigits : 0
    })
  }
}

/**
 * Formats Bitcoin amounts with the appropriate number of decimal places
 * This is a more robust implementation that handles conversion as needed
 * 
 * @param amount The amount to format (as a string)
 * @param currency The currency type (BTC or SATS)
 * @returns Formatted string
 */
export const formatBitcoinAmount = (amount: string, currency: CurrencyType): string => {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount === 0) return '0' // Or handle error appropriately

  if (currency === 'SATS') {
    // Assume the input is already in the correct unit (SATS)
    const satsValue = Math.round(numAmount)
    return satsValue.toLocaleString('en-US', {
      maximumFractionDigits : 0
    })
  } else { // BTC
    // Assume the input is already in BTC
    
    // Format with thousands separators and 8 decimal places
    const parts = numAmount.toFixed(8).split('.')
    const integerPart = parseInt(parts[0]).toLocaleString('en-US')
    let decimalPart = parts[1]
    
    // Trim trailing zeros from decimal part
    decimalPart = decimalPart.replace(/0+$/, '')
    
    // Return formatted string with or without decimal part
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
  }
}

/**
 * Formats currency values for display with proper styling for SATS and BTC
 * @param amount The amount to format
 * @param currency The currency type (BTC or SATS)
 */
export const formatConfirmationValue = (amount: number, currency: CurrencyType) => {
  if (currency === 'SATS') {
    // Assume amount is already in SATS format
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
  // Assume amount is already in BTC format
  return <ThemedText style={styles.value}>{amount.toFixed(8)} {currency}</ThemedText>
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