import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface AmountDisplayProps {
  amount: number;
  displayAmount?: string;
  currency: string;
  type: 'send' | 'receive';
  fiatEquivalent?: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ 
  amount,
  displayAmount,
  currency,
  type,
  fiatEquivalent
}) => {
  const formattedAmount = displayAmount || `${amount} ${currency}`
  
  return (
    <View style={styles.amountContainer}>
      <View style={styles.amountRow}>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.amountValue}>{formattedAmount}</Text>
      </View>
      {fiatEquivalent && (
        <Text style={styles.fiatValue}>= {fiatEquivalent}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  amountContainer : {
    marginBottom : 24,
  },
  amountRow : {
    flexDirection     : 'row',
    justifyContent    : 'space-between',
    alignItems        : 'center',
    paddingVertical   : 16,
    borderBottomWidth : 1,
    borderBottomColor : '#E0E0E0',
  },
  label : {
    fontSize   : 16,
    color      : '#000000',
    fontWeight : '500',
  },
  amountValue : {
    fontSize   : 16,
    fontWeight : 'bold',
    color      : '#000000',
    textAlign  : 'right',
  },
  fiatValue : {
    fontSize  : 14,
    color     : '#777777',
    textAlign : 'right',
    marginTop : 4,
  },
}) 