import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTransactionDetails } from '@/src/hooks/transaction'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { Colors } from '@/src/constants/colors'
import { TransactionConstants } from '@/src/constants/transaction'
import { 
  TransactionDetails,
  TransactionDetailsLoading,
  TransactionDetailsError
} from '@/src/components/features/Transaction/Details'

type TransactionDetailsParams = {
  id: string
}

export default function TransactionDetailsScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<TransactionDetailsParams>()
  const { transaction, loading, error } = useTransactionDetails(id)
  
  const handleBackPress = () => {
    router.back()
  }

  if (loading) {
    return <TransactionDetailsLoading onBackPress={handleBackPress} />
  }

  if (error || !transaction) {
    return <TransactionDetailsError onBackPress={handleBackPress} error={error} />
  }

  return (
    <View style={styles.container}>
      <BackButton 
        onPress={handleBackPress} 
        accessibilityLabel={TransactionConstants.accessibility.backButton}
      />
      <TransactionDetails transaction={transaction} />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : Colors.light.background,
  },
}) 