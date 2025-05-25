import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Transaction } from '@/tests/mockData/transactionData'
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

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  transaction, 
  onPress 
}) => {
  const { type, amount, address } = transaction
  
  // Determine activity type label based on transaction type
  const activityType = type === 'send' ? 'Sent Bitcoin' : 'Received Bitcoin'
  
  // Format the amount with a sign
  const formattedAmount = type === 'receive' 
    ? `$${amount.toFixed(2)}` 
    : `-$${amount.toFixed(2)}`
  
  // Color for the amount (green for receive, standard text color for send)
  const amountColor = type === 'receive' ? styles.receiveAmount : {}
  
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
          {truncateAddress(address)}
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