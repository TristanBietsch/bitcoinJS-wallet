import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Transaction } from '@/src/types/domain/transaction/transaction.types'
import { fonts } from '@/src/constants/fonts'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native'

// Helper function to truncate blockchain addresses
const truncateAddress = (address: string): string => {
  if (!address) return ''
  return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`
}

interface ActivityItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

// Helper function to get display address from transaction
const getDisplayAddress = (transaction: Transaction): string => {
  // For send transactions, show recipient address
  if (transaction.type === 'send' && transaction.recipient) {
    return transaction.recipient
  }
  
  // For receive transactions, we might not have sender info
  // Use transaction ID as fallback
  return transaction.txid?.slice(0, 8) || transaction.id.slice(0, 8) || 'Unknown'
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  transaction, 
  onPress 
}) => {
  const { type, amount } = transaction
  
  // Determine activity type label based on transaction type
  const activityType = type === 'send' ? 'Sent Bitcoin' : 'Received Bitcoin'
  
  // Format the amount in sats with a sign
  const formattedAmount = type === 'receive' 
    ? `+${amount.toLocaleString()} sats` 
    : `-${amount.toLocaleString()} sats`
  
  // Color for the amount (green for receive, standard text color for send)
  const amountColor = type === 'receive' ? styles.receiveAmount : {}
  
  // Get appropriate address to display
  const displayAddress = getDisplayAddress(transaction)
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <View style={[ styles.icon, type === 'receive' ? styles.receiveIcon : styles.sendIcon ]}>
          {type === 'send' ? (
            <ArrowUpRight size={20} color="#F44336" />
          ) : (
            <ArrowDownLeft size={20} color="#4CAF50" />
          )}
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {activityType}
        </ThemedText>
        <ThemedText type="default" style={styles.address}>
          {truncateAddress(displayAddress)}
        </ThemedText>
      </View>
      
      <View style={styles.amountContainer}>
        <ThemedText type="defaultSemiBold" style={[ styles.amount, amountColor ]}>
          {formattedAmount}
        </ThemedText>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container : {
    flexDirection     : 'row',
    alignItems        : 'center',
    paddingVertical   : 16,
    paddingHorizontal : 16,
  },
  iconContainer : {
    marginRight : 12,
  },
  icon : {
    width           : 40,
    height          : 40,
    borderRadius    : 20,
    backgroundColor : '#FFFFFF',
    justifyContent  : 'center',
    alignItems      : 'center',
  },
  sendIcon : {
    backgroundColor : '#FFEBEE',
  },
  receiveIcon : {
    backgroundColor : '#E8F5E9',
  },
  detailsContainer : {
    flex           : 1,
    justifyContent : 'center',
  },
  title : {
    marginBottom : 2,
    fontFamily   : fonts.semibold,
  },
  address : {
    fontSize      : 14,
    opacity       : 0.8,
    fontFamily    : fonts.monospace,
    letterSpacing : -0.5,
  },
  amountContainer : {
    justifyContent : 'center',
    alignItems     : 'flex-end',
  },
  amount : {
    fontSize   : 16,
    fontFamily : fonts.semibold,
  },
  receiveAmount : {
    color : '#4CAF50', // Green color for received amounts
  },
}) 