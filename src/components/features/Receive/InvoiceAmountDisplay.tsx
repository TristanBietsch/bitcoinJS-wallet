import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface InvoiceAmountDisplayProps {
  formattedAmount: string
  label?: string
  style?: ViewStyle
  satsAmount?: string // Requested amount in satoshis
  receivedAmountSats?: number // Actually received amount in satoshis
  paymentStatusError?: string | null // Error message for payment status
}

/**
 * Component for displaying a formatted invoice amount (BTC or SATS)
 * and payment status.
 */
const InvoiceAmountDisplay: React.FC<InvoiceAmountDisplayProps> = ({
  formattedAmount,
  label = 'Amount to Receive:', // Changed label to be more specific
  style,
  satsAmount,
  receivedAmountSats,
  paymentStatusError,
}) => {
  const requestedSatsNum = satsAmount ? parseFloat(satsAmount) : 0
  const hasReceivedPayment = receivedAmountSats !== undefined && receivedAmountSats > 0
  const isPartialPayment = hasReceivedPayment && requestedSatsNum > 0 && receivedAmountSats < requestedSatsNum
  const isOverPayment = hasReceivedPayment && requestedSatsNum > 0 && receivedAmountSats > requestedSatsNum
  const isFullPayment = hasReceivedPayment && requestedSatsNum > 0 && receivedAmountSats === requestedSatsNum

  return (
    <View style={[ styles.container, style ]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.amountText}>{formattedAmount}</ThemedText>

      {paymentStatusError && (
        <ThemedText style={styles.errorText}>
          Error checking payment: {paymentStatusError}
        </ThemedText>
      )}

      {hasReceivedPayment && !paymentStatusError && (
        <View style={styles.statusContainer}>
          <ThemedText style={styles.statusLabel}>Payment Received:</ThemedText>
          <ThemedText style={styles.receivedAmountText}>
            {receivedAmountSats} sats
          </ThemedText>
          {isPartialPayment && (
            <ThemedText style={styles.statusDetailText}> (Partial Payment)</ThemedText>
          )}
          {isOverPayment && (
            <ThemedText style={styles.statusDetailText}> (Overpayment)</ThemedText>
          )}
          {isFullPayment && (
            <ThemedText style={styles.statusDetailText}> (Paid in Full)</ThemedText>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems        : 'center',
    marginTop         : 24,
    marginBottom      : 16,
    width             : '100%',
    paddingHorizontal : 20,
  },
  label : {
    fontSize     : 16,
    color        : '#666',
    marginBottom : 12,
    fontWeight   : '500',
  },
  amountText : {
    fontSize   : 32,
    fontWeight : 'bold',
    color      : '#000',
  },
  statusContainer : {
    marginTop       : 16,
    alignItems      : 'center',
    padding         : 10,
    backgroundColor : '#f0f0f0',
    borderRadius    : 8,
    width           : '90%',
  },
  statusLabel : {
    fontSize     : 14,
    color        : '#333',
    marginBottom : 4,
  },
  receivedAmountText : {
    fontSize   : 18,
    fontWeight : 'bold',
    color      : 'green',
  },
  statusDetailText : {
    fontSize  : 12,
    color     : '#555',
    fontStyle : 'italic',
  },
  errorText : {
    marginTop : 8,
    fontSize  : 14,
    color     : 'red',
    textAlign : 'center',
  },
})

export default InvoiceAmountDisplay 