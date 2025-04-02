import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { COLORS } from '@/src/types/theme/colors.types'
import { fonts } from '@/src/constants/fonts'

// Extend COLORS with warningLight if missing
const extendedColors = {
  ...COLORS,
  warningLight : '#FFF8E1' // Light amber color for warnings
}

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  date: Date;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed';
  fee?: number;
  memo?: string;
  txid?: string;
  confirmations?: number;
}

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
  onViewExplorer?: () => void;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  onClose,
  onViewExplorer,
}) => {
  const {
    type,
    amount,
    currency,
    date,
    recipient,
    sender,
    status,
    fee,
    memo,
    txid,
    confirmations,
  } = transaction

  const formattedDate = new Date(date).toLocaleDateString()
  const formattedTime = new Date(date).toLocaleTimeString()
  const sign = type === 'receive' ? '+' : '-'
  const statusColor = 
    status === 'completed' ? styles.success :
    status === 'pending' ? styles.pending :
    styles.failed

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {type === 'receive' ? 'Received Bitcoin' : 'Sent Bitcoin'}
          </Text>
          <View style={[ styles.statusBadge, statusColor ]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[ styles.amount, type === 'receive' ? styles.receiveAmount : styles.sendAmount ]}>
            {sign}{amount} {currency}
          </Text>
          {fee !== undefined && (
            <Text style={styles.fee}>Fee: {fee} {currency}</Text>
          )}
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formattedDate} {formattedTime}</Text>
          </View>
          
          {type === 'send' && recipient && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.addressValue} numberOfLines={1} ellipsizeMode="middle">{recipient}</Text>
            </View>
          )}
          
          {type === 'receive' && sender && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sender</Text>
              <Text style={styles.addressValue} numberOfLines={1} ellipsizeMode="middle">{sender}</Text>
            </View>
          )}
          
          {confirmations !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confirmations</Text>
              <Text style={styles.detailValue}>{confirmations}</Text>
            </View>
          )}
          
          {memo && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Memo</Text>
              <Text style={styles.detailValue}>{memo}</Text>
            </View>
          )}
          
          {txid && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.addressValue} numberOfLines={1} ellipsizeMode="middle">{txid}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {onViewExplorer && txid && (
            <TouchableOpacity
              style={[ styles.button, styles.secondaryButton ]}
              onPress={onViewExplorer}
            >
              <Text style={styles.buttonText}>View in Explorer</Text>
            </TouchableOpacity>
          )}
          <View style={styles.buttonSpacer} />
          <TouchableOpacity
            style={[ styles.button, styles.outlineButton ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },
  card : {
    margin          : 16,
    backgroundColor : COLORS.white,
    borderRadius    : 12,
    padding         : 16,
    shadowColor     : '#000',
    shadowOffset    : {
      width  : 0,
      height : 2,
    },
    shadowOpacity : 0.25,
    shadowRadius  : 3.84,
    elevation     : 5,
  },
  header : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'center',
    marginBottom   : 20,
  },
  title : {
    fontSize   : 20,
    fontWeight : 'bold',
    color      : COLORS.text,
  },
  statusBadge : {
    paddingHorizontal : 12,
    paddingVertical   : 6,
    borderRadius      : 16,
  },
  success : {
    backgroundColor : COLORS.successLight,
  },
  pending : {
    backgroundColor : extendedColors.warningLight,
  },
  failed : {
    backgroundColor : COLORS.errorLight,
  },
  statusText : {
    fontSize      : 12,
    fontWeight    : '600',
    textTransform : 'uppercase',
  },
  amountContainer : {
    alignItems   : 'center',
    marginBottom : 24,
  },
  amount : {
    fontSize     : 28,
    fontWeight   : 'bold',
    marginBottom : 4,
  },
  receiveAmount : {
    color : COLORS.success,
  },
  sendAmount : {
    color : COLORS.error,
  },
  fee : {
    fontSize : 14,
    color    : COLORS.textSecondary,
  },
  detailsSection : {
    marginBottom : 24,
  },
  detailRow : {
    flexDirection     : 'row',
    paddingVertical   : 12,
    borderBottomWidth : 1,
    borderBottomColor : COLORS.border,
  },
  detailLabel : {
    flex     : 1,
    fontSize : 14,
    color    : COLORS.textSecondary,
  },
  detailValue : {
    flex      : 2,
    fontSize  : 14,
    color     : COLORS.text,
    textAlign : 'right',
  },
  addressValue : {
    flex       : 2,
    fontSize   : 14,
    color      : COLORS.text,
    textAlign  : 'right',
    fontFamily : fonts.monospace,
  },
  buttonContainer : {
    marginTop : 8,
  },
  buttonSpacer : {
    height : 12,
  },
  button : {
    padding        : 12,
    borderRadius   : 8,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  secondaryButton : {
    backgroundColor : COLORS.primary,
  },
  outlineButton : {
    backgroundColor : 'transparent',
    borderWidth     : 1,
    borderColor     : COLORS.primary,
  },
  buttonText : {
    color      : COLORS.text,
    fontSize   : 16,
    fontWeight : '600',
  },
})

export default TransactionDetails 