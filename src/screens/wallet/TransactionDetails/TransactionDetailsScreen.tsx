import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Text } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTransactionDetails } from '@/src/hooks/transaction'
import { 
  TransactionHeader, 
  AmountDisplay, 
  TransactionDetails as TransactionDetailsComponent
} from '@/src/components/features/Transaction/Details'

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { transaction, loading, error } = useTransactionDetails(id)
  
  const handleBackPress = () => {
    router.back()
  }
  
  // Show loading state
  if (loading) {
    return (
      <View style={ [ styles.container, styles.loadingContainer ] }>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    )
  }
  
  // Show error state if transaction not found or error occurred
  if (error || !transaction) {
    return (
      <View style={ [ styles.container, styles.errorContainer ] }>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.errorText}>
          {error ? 'Error loading transaction' : 'Transaction not found'}
        </Text>
      </View>
    )
  }

  // For this example, we're assuming this is a send transaction (per the image)
  const displayAmount = `${transaction.amount} ${transaction.currency}`
  const fiatEquivalent = `$${(transaction.amount * 0.00023).toFixed(2)} USD`
  
  // Calculate the total amount (amount + fee)
  const totalAmount = transaction.fee 
    ? Number(transaction.amount) + Number(transaction.fee)
    : transaction.amount
  // We'll use totalFiatEquivalent in future enhancements
  const _totalFiatEquivalent = `$${(totalAmount * 0.00023).toFixed(2)} USD`

  return (
    <View style={styles.container}>
      {/* Custom Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          {/* Transaction Header */}
          <TransactionHeader 
            type={transaction.type} 
            showSuccessIcon={true}
          />

          {/* Amount Display */}
          <AmountDisplay 
            amount={transaction.amount} 
            displayAmount={displayAmount}
            currency={transaction.currency} 
            type={transaction.type} 
            fiatEquivalent={fiatEquivalent}
          />

          {/* Transaction Details */}
          <TransactionDetailsComponent 
            transaction={transaction}
            showFee={true}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#F8F9FA',
  },
  loadingContainer : {
    justifyContent : 'center',
    alignItems     : 'center',
  },
  errorContainer : {
    justifyContent : 'center',
    alignItems     : 'center',
  },
  errorText : {
    fontSize   : 18,
    color      : '#F44336',
    fontWeight : '500',
  },
  backButton : {
    position       : 'absolute',
    top            : 70,
    left           : 16,
    zIndex         : 10,
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  scrollView : {
    flex      : 1,
    marginTop : 70,
  },
  card : {
    margin          : 16,
    backgroundColor : '#FFFFFF',
    borderRadius    : 12,
    padding         : 16,
    shadowColor     : '#000',
    shadowOffset    : {
      width  : 0,
      height : 2,
    },
    shadowOpacity : 0.1,
    shadowRadius  : 3.84,
    elevation     : 5,
  },
}) 