import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '@/src/types/colors'

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  date: Date;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const {
    type,
    amount,
    currency,
    date,
    recipient,
    sender,
    status,
  } = transaction

  const formattedDate = new Date(date).toLocaleDateString()
  const formattedTime = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Determine sign and color based on transaction type
  const sign = type === 'receive' ? '+' : '-'
  const amountColor = type === 'receive' ? styles.receiveAmount : styles.sendAmount

  // Determine the counterparty (who sent or received)
  const counterparty = type === 'send' ? recipient : sender

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View style={[ styles.icon, type === 'receive' ? styles.receiveIcon : styles.sendIcon ]}>
          <Text style={styles.iconText}>{type === 'receive' ? '↓' : '↑'}</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.type}>{type === 'receive' ? 'Received' : 'Sent'}</Text>
        {counterparty && <Text style={styles.counterparty}>{counterparty}</Text>}
        <Text style={styles.timestamp}>{formattedDate} at {formattedTime}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[ styles.amount, amountColor, status === 'failed' && styles.failedAmount ]}>
          {sign}{amount} {currency}
        </Text>
        <Text style={[ styles.status, 
          status === 'pending' && styles.pendingStatus,
          status === 'failed' && styles.failedStatus ]}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container : {
    flexDirection     : 'row',
    paddingVertical   : 16,
    borderBottomWidth : 1,
    borderBottomColor : COLORS.border,
  },
  iconContainer : {
    marginRight    : 12,
    justifyContent : 'center',
  },
  icon : {
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  sendIcon : {
    backgroundColor : COLORS.errorLight,
  },
  receiveIcon : {
    backgroundColor : COLORS.successLight,
  },
  iconText : {
    fontSize   : 16,
    fontWeight : 'bold',
  },
  detailsContainer : {
    flex           : 1,
    justifyContent : 'center',
  },
  type : {
    fontSize     : 16,
    fontWeight   : '600',
    color        : COLORS.text,
    marginBottom : 4,
  },
  counterparty : {
    fontSize     : 14,
    color        : COLORS.textSecondary,
    marginBottom : 4,
  },
  timestamp : {
    fontSize : 12,
    color    : COLORS.textSecondary,
  },
  amountContainer : {
    justifyContent : 'center',
    alignItems     : 'flex-end',
  },
  amount : {
    fontSize     : 16,
    fontWeight   : '600',
    marginBottom : 4,
  },
  sendAmount : {
    color : COLORS.error,
  },
  receiveAmount : {
    color : COLORS.success,
  },
  failedAmount : {
    textDecorationLine : 'line-through',
    color              : COLORS.textSecondary,
  },
  status : {
    fontSize : 12,
    color    : COLORS.success,
  },
  pendingStatus : {
    color : COLORS.warning,
  },
  failedStatus : {
    color : COLORS.error,
  },
})

export default TransactionItem 