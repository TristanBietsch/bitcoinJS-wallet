import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Text } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ChevronLeft, Check } from 'lucide-react-native'
import { useTransactionDetails } from '@/src/hooks/transaction'
import { TransactionDetails as TransactionDetailsComponent } from '@/src/components/features/Transaction/Details'

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.backButton} onPress={onPress}>
    <ChevronLeft size={24} color="black" />
  </TouchableOpacity>
)

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
        <BackButton onPress={handleBackPress} />
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    )
  }
  
  // Show error state if transaction not found or error occurred
  if (error || !transaction) {
    return (
      <View style={ [ styles.container, styles.errorContainer ] }>
        <BackButton onPress={handleBackPress} />
        <Text style={styles.errorText}>
          {error ? 'Error loading transaction' : 'Transaction not found'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <BackButton onPress={handleBackPress} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          {/* Transaction Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Check size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>
              {transaction.type === 'send' ? 'Sent' : 'Received'}
            </Text>
          </View>

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
  headerContainer : {
    alignItems     : 'center',
    justifyContent : 'center',
    marginBottom   : 32,
    marginTop      : 16,
  },
  iconContainer : {
    width           : 64,
    height          : 64,
    borderRadius    : 32,
    backgroundColor : '#00C853',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : 16,
    borderWidth     : 0,
    borderColor     : '#00C853',
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 1 },
    shadowOpacity   : 0.2,
    shadowRadius    : 2,
    elevation       : 3,
  },
  headerTitle : {
    fontSize   : 24,
    fontWeight : 'bold',
    color      : '#000000',
  },
}) 