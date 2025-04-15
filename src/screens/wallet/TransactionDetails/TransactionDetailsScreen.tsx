import React from 'react'
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTransactionDetails } from '@/src/hooks/transaction'
import { formatNumber } from '@/src/utils/formatting/formatNumber'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { StatusIcon } from '@/src/components/ui/View/StatusIcon'
import { TransactionField } from '@/src/components/ui/View/TransactionField'
import { MempoolButton } from '@/src/components/ui/View/MempoolButton'
import { Colors } from '@/src/constants/colors'
import { TransactionConstants } from '@/src/constants/transaction'

type TransactionDetailsParams = {
  id: string;
}

export default function TransactionDetailsScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<TransactionDetailsParams>()
  const { transaction, loading, error } = useTransactionDetails(id)
  
  const handleBackPress = () => {
    router.back()
  }

  if (loading) {
    return (
      <View style={[ styles.container, styles.centerContent ]}>
        <BackButton 
          onPress={handleBackPress} 
          accessibilityLabel={TransactionConstants.accessibility.backButton}
        />
        <ActivityIndicator size="large" color={Colors.light.electricBlue} />
      </View>
    )
  }

  if (error || !transaction) {
    return (
      <View style={[ styles.container, styles.centerContent ]}>
        <BackButton 
          onPress={handleBackPress} 
          accessibilityLabel={TransactionConstants.accessibility.backButton}
        />
        <Text style={styles.errorText}>
          {error ? 'Error loading transaction' : 'Transaction not found'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <BackButton 
        onPress={handleBackPress} 
        accessibilityLabel={TransactionConstants.accessibility.backButton}
      />
      
      <View style={styles.content}>
        <StatusIcon 
          type={transaction.type} 
          accessibilityLabel={TransactionConstants.accessibility.statusIcon(transaction.type)}
        />
        
        <View style={styles.detailsContainer}>
          <TransactionField 
            label={TransactionConstants.labels.amount}
            value={`${formatNumber(transaction.amount)} ${transaction.currency}`}
            subValue={transaction.fiatAmount}
            accessibilityLabel={TransactionConstants.accessibility.amountField}
          />
          
          <TransactionField 
            label={transaction.type === 'send' ? 'To Address' : 'From Address'}
            value={transaction.recipient || ''}
            isAddress
            accessibilityLabel={TransactionConstants.accessibility.addressField(transaction.type)}
          />
          
          <View style={styles.fieldFee}>
            <TransactionField 
              label={TransactionConstants.labels.networkFee}
              value={`${transaction.fee || 0} sats`}
              subValue={transaction.feeRate ? `${transaction.feeRate} sat/byte` : undefined}
              accessibilityLabel={TransactionConstants.accessibility.feeField}
            />
          </View>
          
          <View style={styles.fieldTotal}>
            <TransactionField 
              label={TransactionConstants.labels.total}
              value={`${formatNumber(transaction.total || transaction.amount)} ${transaction.currency}`}
              subValue={transaction.fiatTotal}
              accessibilityLabel={TransactionConstants.accessibility.totalField}
            />
          </View>
        </View>
        
        <MempoolButton 
          txid={transaction.txid} 
          accessibilityLabel={TransactionConstants.accessibility.mempoolButton}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : Colors.light.background,
  },
  centerContent : {
    justifyContent : 'center',
    alignItems     : 'center',
  },
  errorText : {
    fontSize  : 16,
    color     : Colors.light.errorRed,
    textAlign : 'center',
    marginTop : 16,
  },
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 20,
    paddingTop        : 120,
    paddingBottom     : 40,
  },
  detailsContainer : {
    width             : '100%',
    marginBottom      : 48,
    paddingHorizontal : 16,
  },
  fieldFee : {
    width        : '100%',
    marginBottom : 16,
    marginTop    : 16
  },
  fieldTotal : {
    width     : '100%',
    marginTop : 16,
  },
}) 