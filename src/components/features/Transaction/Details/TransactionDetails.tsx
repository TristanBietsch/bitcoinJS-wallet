import React from 'react'
import { View, StyleSheet } from 'react-native'
import { StatusIcon } from '@/src/components/ui/View/StatusIcon'
import { TransactionField } from '@/src/components/ui/View/TransactionField'
import { MempoolButton } from '@/src/components/ui/View/MempoolButton'
import { formatNumber } from '@/src/utils/formatting/formatNumber'
import { TransactionConstants } from '@/src/constants/transaction'

type TransactionType = 'send' | 'receive'

interface TransactionDetailsProps {
  transaction: {
    type: TransactionType
    amount: number
    currency: string
    fiatAmount?: string
    recipient?: string
    fee?: number
    feeRate?: string
    total?: number
    fiatTotal?: string
    txid?: string
  }
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction }) => {
  return (
    <View style={styles.content}>
      <StatusIcon 
        type={transaction.type} 
        accessibilityLabel={TransactionConstants.accessibility.statusIcon(transaction.type)}
      />
      
      <View style={styles.detailsContainer}>
        <TransactionField 
          label={TransactionConstants.labels.amount}
          value={`${formatNumber(transaction.amount)} ${transaction.currency}`}
          subValue={transaction.fiatAmount}
          accessibilityLabel={TransactionConstants.accessibility.amountField}
        />
        
        <TransactionField 
          label={transaction.type === 'send' ? 'To Address' : 'From Address'}
          value={transaction.recipient || ''}
          isAddress
          accessibilityLabel={TransactionConstants.accessibility.addressField(transaction.type)}
        />
        
        <View style={styles.fieldFee}>
          <TransactionField 
            label={TransactionConstants.labels.networkFee}
            value={`${transaction.fee || 0} sats`}
            subValue={transaction.feeRate ? `${transaction.feeRate} sat/byte` : undefined}
            accessibilityLabel={TransactionConstants.accessibility.feeField}
          />
        </View>
        
        <View style={styles.fieldTotal}>
          <TransactionField 
            label={TransactionConstants.labels.total}
            value={`${formatNumber(transaction.total || transaction.amount)} ${transaction.currency}`}
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