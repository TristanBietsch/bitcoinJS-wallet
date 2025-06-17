import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  date: Date;
  recipient?: string;
  sender?: string;
  status: 'sending' | 'pending' | 'completed' | 'failed';
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
          status === 'sending' && styles.sendingStatus,
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
    borderBottomColor : '#E0E0E0',
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
    backgroundColor : '#FFEBEE',
  },
  receiveIcon : {
    backgroundColor : '#E8F5E9',
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
    color        : '#000000',
    marginBottom : 4,
  },
  counterparty : {
    fontSize     : 14,
    color        : '#666666',
    marginBottom : 4,
  },
  timestamp : {
    fontSize : 12,
    color    : '#666666',
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
    color : '#F44336',
  },
  receiveAmount : {
    color : '#4CAF50',
  },
  failedAmount : {
    textDecorationLine : 'line-through',
    color              : '#666666',
  },
  status : {
    fontSize : 12,
    color    : '#4CAF50',
  },
  sendingStatus : {
    color : '#2196F3',
  },
  pendingStatus : {
    color : '#FFA000',
  },
  failedStatus : {
    color : '#F44336',
  },
})

export default TransactionItem 