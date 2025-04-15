import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, Linking } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ChevronLeft, ExternalLink, ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react-native'
import { useTransactionDetails } from '@/src/hooks/transaction'

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.backButton} onPress={onPress}>
    <ChevronLeft size={24} color="black" />
  </TouchableOpacity>
)

const StatusIcon = ({ type }: { type: 'send' | 'receive' }) => (
  <View style={styles.statusIconContainer}>
    <View style={[ styles.statusIcon, type === 'receive' ? styles.receiveIcon : styles.sendIcon ]}>
      {type === 'send' ? (
        <ArrowUpRight size={32} color="#FFFFFF" />
      ) : (
        <ArrowDownLeft size={32} color="#FFFFFF" />
      )}
    </View>
    <Text style={styles.statusText}>{type === 'send' ? 'Sent' : 'Received'}</Text>
  </View>
)

const TransactionField = ({ label, value, subValue, isAddress = false, showArrow = false }: {
  label: string
  value: string | number
  subValue?: string
  isAddress?: boolean
  showArrow?: boolean
}) => (
  <View style={styles.field}>
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueWrapper}>
        <View style={styles.valueRow}>
          <Text style={[ styles.fieldValue, isAddress && styles.addressText ]}>{value}</Text>
          {showArrow && <ArrowRight size={16} color="#000000" style={styles.arrowIcon} />}
        </View>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  </View>
)

const MempoolButton = ({ txid }: { txid?: string }) => {
  const handlePress = () => {
    if (txid) {
      Linking.openURL(`https://mempool.space/tx/${txid}`)
    }
  }
  
  return (
    <TouchableOpacity 
      style={styles.mempoolButton} 
      onPress={handlePress}
      disabled={!txid}
    >
      <Text style={styles.mempoolButtonText}>View on Mempool</Text>
      <ExternalLink size={16} color="#000" />
    </TouchableOpacity>
  )
}

const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0'
  return num.toLocaleString('en-US')
}

export default function TransactionDetailsScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { transaction, loading, error } = useTransactionDetails(id)
  
  const handleBackPress = () => {
    router.back()
  }

  if (loading) {
    return (
      <View style={[ styles.container, styles.centerContent ]}>
        <BackButton onPress={handleBackPress} />
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    )
  }

  if (error || !transaction) {
    return (
      <View style={[ styles.container, styles.centerContent ]}>
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
        <View style={styles.content}>
          <StatusIcon type={transaction.type} />
          
          <View style={styles.detailsContainer}>
            <TransactionField 
              label={transaction.type === 'send' ? 'Amount Sent' : 'Amount Received'}
              value={`${formatNumber(transaction.amount)} ${transaction.currency}`}
              subValue={transaction.fiatAmount}
            />
            
            <TransactionField 
              label={transaction.type === 'send' ? 'To Address' : 'From Address'}
              value={transaction.recipient || ''}
              isAddress
            />
            
            <View style={styles.fieldFee}>
              <TransactionField 
                label="Fee" 
                value="100 sats"
                subValue="xxxx sat/byte"
              />
            </View>
            
            <View style={styles.fieldTotal}>
              <TransactionField 
                label="Total" 
                value={`${formatNumber(transaction.total)} ${transaction.currency}`}
                subValue={transaction.fiatTotal}
              />
            </View>
          </View>
          
          <MempoolButton txid={transaction.txid} />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#FFFFFF',
  },
  centerContent : {
    justifyContent : 'center',
    alignItems     : 'center',
  },
  errorText : {
    fontSize  : 16,
    color     : '#F44336',
    textAlign : 'center',
    marginTop : 16,
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
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 20,
    paddingTop        : 40,
  },
  statusIconContainer : {
    alignItems   : 'center',
    marginBottom : 48,
  },
  statusIcon : {
    width           : 64,
    height          : 64,
    borderRadius    : 32,
    backgroundColor : '#000000',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : 16,
  },
  sendIcon : {
    backgroundColor : '#000000',
  },
  receiveIcon : {
    backgroundColor : '#000000',
  },
  statusText : {
    fontSize   : 24,
    fontWeight : '600',
  },
  detailsContainer : {
    width             : '100%',
    marginBottom      : 48,
    paddingHorizontal : 16,
  },
  field : {
    marginBottom : 40,
    width       : '100%',
  },
  fieldFee : {
    width          : '100%',
    marginBottom   : 16,
    marginTop      : 16
  },
  fieldTotal : {
    width       : '100%',
    marginTop   : 16,
  },
  fieldRow: {
    flexDirection  : 'row',
    alignItems     : 'flex-start',
    justifyContent : 'space-between',
    gap           : 20,
  },
  valueRow: {
    flexDirection : 'row',
    alignItems    : 'center',
    gap          : 4,
  },
  arrowIcon: {
    marginLeft : 4,
  },
  fieldLabel: {
    fontSize   : 16,
    color      : '#666666',
    flex       : 1,
    paddingTop : 4,
  },
  fieldValueWrapper: {
    flex       : 2,
    alignItems : 'flex-end',
  },
  fieldValue: {
    fontSize   : 18,
    fontWeight : '500',
    textAlign  : 'right',
    lineHeight : 24,
  },
  addressText : {
    fontSize   : 14,
    width      : '100%',
    flexWrap   : 'wrap',
    lineHeight : 20,
  },
  subValue : {
    fontSize  : 14,
    color     : '#666666',
    marginTop : 4,
    textAlign : 'right',
    opacity   : 0.8,
  },
  mempoolButton : {
    flexDirection   : 'row',
    alignItems      : 'center',
    gap            : 8,
    paddingVertical : 16,
    marginTop       : 8,
  },
  mempoolButtonText : {
    fontSize   : 16,
    fontWeight : '500',
  },
}) 