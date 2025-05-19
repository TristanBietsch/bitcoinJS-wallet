import React from 'react'
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { ExternalLink } from 'lucide-react-native'
import { formatConfirmationValue } from '@/src/utils/formatting/formatCurrencyValue'
import { formatAddressIntoLines } from '@/src/utils/formatting/formatAddress'
import { CurrencyType } from '@/src/types/domain/finance'
import { TransactionFee } from '@/src/utils/transactions/feeCalculator'
import { transactionStyles } from '@/src/constants/transactionStyles'

type TransactionConfirmationDetailsProps = {
  amount: number
  address: string
  fee: TransactionFee
  currency: CurrencyType
  totalAmount: number
}

/**
 * Component to display transaction confirmation details
 */
export const TransactionConfirmationDetails = ({
  amount,
  address,
  fee,
  currency,
  totalAmount,
}: TransactionConfirmationDetailsProps) => {
  const addressLines = formatAddressIntoLines(address)
  
  return (
    <View style={styles.content}>
      <View style={styles.detailRow}>
        <ThemedText style={styles.label}>Amount</ThemedText>
        {formatConfirmationValue(amount, currency)}
      </View>
      
      <View style={styles.detailRow}>
        <ThemedText style={styles.label}>To address</ThemedText>
        <View style={styles.addressContainer}>
          {addressLines.map((line, index) => (
            <ThemedText key={index} style={styles.value} numberOfLines={1}>
              {line}
            </ThemedText>
          ))}
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <View style={styles.labelWithIcon}>
          <ThemedText style={styles.label}>Fee</ThemedText>
          <TouchableOpacity onPress={() => Linking.openURL('https://mempool.space')}>
            <ExternalLink size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.valueContainer}>
          <View style={styles.satsContainer}>
            <ThemedText style={styles.value}>{fee.sats.toLocaleString()}</ThemedText>
            <ThemedText style={styles.satsLabel}>sats</ThemedText>
          </View>
          <ThemedText style={styles.subtext}>
            {fee.feeRate} sat/vbyte
          </ThemedText>
        </View>
      </View>
      
      <View style={[ styles.detailRow, styles.totalRow ]}>
        <ThemedText style={[ styles.label, styles.bold ]}>Total</ThemedText>
        {formatConfirmationValue(totalAmount, currency)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  ...transactionStyles,
  labelWithIcon : {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 8
  },
  valueContainer : {
    alignItems : 'flex-end'
  },
  addressContainer : {
    alignItems : 'flex-end',
    flex       : 1,
    marginLeft : 40
  },
  value : {
    fontSize  : 16,
    color     : '#000',
    textAlign : 'right'
  },
  subtext : {
    fontSize  : 14,
    color     : '#666',
    marginTop : 4
  },
  satsContainer : {
    flexDirection : 'row',
    alignItems    : 'baseline'
  },
  satsLabel : {
    fontSize   : 12,
    color      : '#666',
    marginLeft : 4
  }
})

export default TransactionConfirmationDetails 