import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { DetailItem } from './DetailItem'
import { Transaction } from '@/src/types/transaction'

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
  } = transaction

  // Create a formatted representation for fee with sat/vbyte
  const formattedFee = fee ? `${fee} ${currency}` : ''
  const feePerByte = 'xxxx sat/vbyte'
  
  return (
    <View style={styles.container}>
      {/* To/From Address */}
      <DetailItem 
        label={type === 'send' ? 'To address' : 'From address'}
        value={recipient || ''}
        isAddress
      />
      
      {/* Fee information - only show for send transactions */}
      {showFee && type === 'send' && fee && (
        <DetailItem 
          label="Fee"
          value={formattedFee}
          rightElement={
            <Text style={styles.feePerByte}>{feePerByte}</Text>
          }
        />
      )}
      
      {/* Total */}
      {type === 'send' && fee && (
        <DetailItem 
          label="Total"
          value={`${Number(transaction.amount) + Number(fee)} ${currency}`}
        />
      )}
      
      {/* Confirmations if applicable */}
      {confirmations !== undefined && (
        <DetailItem 
          label="Confirmations"
          value={confirmations.toString()}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    marginBottom : 24,
  },
  feePerByte : {
    fontSize    : 12,
    color       : '#777777',
    marginRight : 4,
  },
}) 