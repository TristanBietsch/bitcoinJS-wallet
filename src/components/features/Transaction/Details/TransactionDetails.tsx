import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Transaction } from '@/src/types/transaction'
import { fonts } from '@/src/constants/fonts'

interface TransactionDetailsProps {
  transaction: Transaction;
  showFee?: boolean;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
  transaction,
  showFee = true,
}) => {
  const {
    type,
    recipient,
    fee,
    currency,
    confirmations,
    txid,
    feeRate,
    total,
  } = transaction

  // Use the pre-calculated values from mock data
  const formattedFee = fee ? `${fee} ${currency}` : ''
  
  const renderDetailRow = (label: string, value: string, isAddress = false, rightElement?: React.ReactNode) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text 
          style={isAddress ? styles.addressValue : styles.detailValue}
          numberOfLines={isAddress ? 1 : undefined}
          ellipsizeMode={isAddress ? "middle" : undefined}
        >
          {value}
        </Text>
        {rightElement}
      </View>
    </View>
  )
  
  return (
    <View style={styles.container}>
      {/* To/From Address */}
      {renderDetailRow(
        type === 'send' ? 'To address' : 'From address',
        recipient || '',
        true
      )}
      
      {/* Fee information - only show for send transactions */}
      {showFee && type === 'send' && fee && (
        renderDetailRow(
          "Fee",
          formattedFee,
          false,
          <Text style={styles.feePerByte}>{feeRate}</Text>
        )
      )}
      
      {/* Total */}
      {type === 'send' && fee && total && (
        renderDetailRow(
          "Total",
          `${total} ${currency}`
        )
      )}
      
      {/* Confirmations if applicable */}
      {confirmations !== undefined && (
        renderDetailRow(
          "Confirmations",
          confirmations.toString()
        )
      )}
      
      {/* Transaction ID */}
      {txid && (
        renderDetailRow(
          "Transaction ID",
          txid,
          true
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    marginBottom : 24,
  },
  detailRow : {
    flexDirection     : 'row',
    paddingVertical   : 16,
    borderBottomWidth : 1,
    borderBottomColor : '#E0E0E0',
  },
  detailLabel : {
    flex       : 1,
    fontSize   : 16,
    color      : '#000000',
    fontWeight : '500',
  },
  valueContainer : {
    flex           : 2,
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'flex-end',
  },
  detailValue : {
    fontSize  : 16,
    color     : '#000000',
    textAlign : 'right',
  },
  addressValue : {
    fontSize   : 16,
    color      : '#000000',
    textAlign  : 'right',
    fontFamily : fonts.monospace,
  },
  feePerByte : {
    fontSize    : 12,
    color       : '#777777',
    marginRight : 4,
  },
}) 