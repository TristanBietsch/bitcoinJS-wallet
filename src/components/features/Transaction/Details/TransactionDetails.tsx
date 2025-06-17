import React from 'react'
import { View, StyleSheet } from 'react-native'
import { StatusIcon } from '@/src/components/ui/View/StatusIcon'
import { TransactionField } from '@/src/components/ui/View/TransactionField'
import { MempoolButton } from '@/src/components/ui/View/MempoolButton'

import { TransactionConstants } from '@/src/constants/transaction'
import { Transaction } from '@/src/types/domain/transaction/transaction.types'

interface TransactionDetailsProps {
  transaction: Transaction
}

// Helper function to get display address
const getDisplayAddress = (transaction: Transaction): string => {
  if (transaction.type === 'send' && transaction.recipient) {
    return transaction.recipient
  }
  
  // For receive transactions, we might not have sender info
  // Use transaction ID or fallback
  return transaction.txid?.slice(0, 12) || transaction.id.slice(0, 12) || 'Unknown'
}

// Helper function to format sats amount
const formatSatsAmount = (amount: number): string => {
  return `${amount.toLocaleString()} sats`
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction }) => {
  const displayAddress = getDisplayAddress(transaction)
  const formattedAmount = formatSatsAmount(transaction.amount)
  const formattedFee = transaction.fee ? formatSatsAmount(transaction.fee) : '0 sats'
  const formattedTotal = transaction.total ? formatSatsAmount(transaction.total) : formatSatsAmount(transaction.amount + (transaction.fee || 0))
  
  return (
    <View style={styles.content}>
      <StatusIcon 
        type={transaction.type} 
        accessibilityLabel={TransactionConstants.accessibility.statusIcon(transaction.type)}
      />
      
      <View style={styles.detailsContainer}>
        <TransactionField 
          label={TransactionConstants.labels.amount}
          value={formattedAmount}
          subValue={transaction.fiatAmount}
          accessibilityLabel={TransactionConstants.accessibility.amountField}
        />
        
        <TransactionField 
          label={transaction.type === 'send' ? 'To Address' : 'From Address'}
          value={displayAddress}
          isAddress
          accessibilityLabel={TransactionConstants.accessibility.addressField(transaction.type)}
        />
        
        <View style={styles.fieldFee}>
          <TransactionField 
            label={TransactionConstants.labels.networkFee}
            value={formattedFee}
            subValue={transaction.feeRate ? `${transaction.feeRate} sat/vbyte` : undefined}
            accessibilityLabel={TransactionConstants.accessibility.feeField}
          />
        </View>
        
        <View style={styles.fieldTotal}>
          <TransactionField 
            label={TransactionConstants.labels.total}
            value={formattedTotal}
            subValue={transaction.fiatTotal}
            accessibilityLabel={TransactionConstants.accessibility.totalField}
          />
        </View>
      </View>
      
      {transaction.txid && (
        <MempoolButton 
          txid={transaction.txid} 
          accessibilityLabel={TransactionConstants.accessibility.mempoolButton}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 20,
    paddingTop        : 120,
    paddingBottom     : 40,
  },
  detailsContainer : {
    width             : '100%',
    marginBottom      : 48,
    paddingHorizontal : 16,
  },
  fieldFee : {
    width        : '100%',
    marginBottom : 16,
    marginTop    : 16
  },
  fieldTotal : {
    width     : '100%',
    marginTop : 16,
  },
}) 