import React from 'react'
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import { ChevronLeft, ExternalLink } from 'lucide-react-native'
import { useSendStore } from '@/src/store/sendStore'
import { transactionFees } from '@/tests/mockData/transactionData'
import { formatCurrency } from '@/tests/mockData/walletData'

// Speed options with their fees (matching SendAddressScreen)
const speedOptions = {
  economy : {
    sats    : transactionFees.tiers.economy.sats,
    usd     : transactionFees.tiers.economy.usd,
    feeRate : transactionFees.tiers.economy.feeRate
  },
  standard : {
    sats    : transactionFees.tiers.standard.sats,
    usd     : transactionFees.tiers.standard.usd,
    feeRate : transactionFees.tiers.standard.feeRate
  },
  express : {
    sats    : transactionFees.tiers.express.sats,
    usd     : transactionFees.tiers.express.usd,
    feeRate : transactionFees.tiers.express.feeRate
  }
}

type CurrencyType = 'USD' | 'BTC' | 'SATS';

// Custom formatter for the confirmation screen
const formatConfirmationValue = (amount: number, currency: CurrencyType) => {
  if (currency === 'SATS') {
    const formattedNumber = amount.toLocaleString('en-US', {
      minimumFractionDigits : 0,
      maximumFractionDigits : 0
    })
    return (
      <View style={styles.satsContainer}>
        <ThemedText style={styles.value}>{formattedNumber}</ThemedText>
        <ThemedText style={styles.satsLabel}>sats</ThemedText>
      </View>
    )
  }
  return <ThemedText style={styles.value}>{formatCurrency(amount, currency)}</ThemedText>
}

export default function SendConfirmScreen() {
  const router = useRouter()
  const { address, speed, customFee } = useSendStore()
  const params = useLocalSearchParams<{ amount: string; currency: string }>()
  
  // Get fee based on selected speed or custom fee
  let fee = {
    sats    : 0,
    usd     : 0,
    feeRate : 0
  }
  
  // Use custom fee if selected, otherwise use standard tiers
  if (speed === 'custom' && customFee) {
    fee = {
      sats    : customFee.totalSats,
      usd     : Number((customFee.totalSats * transactionFees.conversion.satToDollar).toFixed(2)),
      feeRate : customFee.feeRate
    }
  } else {
    fee = speedOptions[speed as keyof typeof speedOptions]
  }
  
  // Parse amount and currency
  const amount = parseFloat(params.amount || '0')
  const currency = (params.currency || 'USD') as CurrencyType
  
  // Calculate total (amount + fee) in the correct currency
  const getFeeInCurrency = () => {
    if (currency === 'USD') return fee.usd
    if (currency === 'SATS') return fee.sats
    // If BTC, convert sats to BTC
    return fee.sats / 100000000
  }
  
  const totalAmount = amount + getFeeInCurrency()
  
  // Format address into lines
  const addressLines = [
    address.slice(0, 20),
    address.slice(20, 40),
    address.slice(40)
  ].filter(Boolean)
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>
      
      {/* Transaction Details */}
      <View style={styles.content}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.label}>Amount</ThemedText>
          {formatConfirmationValue(amount, currency)}
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.label}>To address</ThemedText>
          <View style={styles.addressContainer}>
            {addressLines.map((line, index) => (
              <ThemedText key={index} style={styles.value} numberOfLines={1}>
                {line}
              </ThemedText>
            ))}
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.labelWithIcon}>
            <ThemedText style={styles.label}>Fee</ThemedText>
            <TouchableOpacity onPress={() => Linking.openURL('https://mempool.space')}>
              <ExternalLink size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.valueContainer}>
            {formatConfirmationValue(getFeeInCurrency(), currency)}
            <ThemedText style={styles.subtext}>
              {fee.feeRate || ((speed === 'economy') ? 3 : (speed === 'standard') ? 5 : 8)} sat/vbyte
            </ThemedText>
          </View>
        </View>
        
        <View style={[ styles.detailRow, styles.totalRow ]}>
          <ThemedText style={[ styles.label, styles.bold ]}>Total</ThemedText>
          {formatConfirmationValue(totalAmount, currency)}
        </View>
      </View>
      
      {/* Send Button */}
      <TouchableOpacity 
        style={styles.sendButton}
        onPress={() => {
          router.replace('/send/loading' as any)
        }}
      >
        <ThemedText style={styles.sendButtonText}>Send</ThemedText>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1
  },
  backButton : {
    position       : 'absolute',
    top            : 60,
    left           : 20,
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    alignItems     : 'center',
    justifyContent : 'center'
  },
  content : {
    flex              : 1,
    paddingHorizontal : 20,
    paddingTop        : 120,
    gap               : 32
  },
  detailRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'flex-start'
  },
  labelWithIcon : {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 8
  },
  label : {
    fontSize : 16,
    color    : '#666'
  },
  valueContainer : {
    alignItems : 'flex-end'
  },
  addressContainer : {
    alignItems : 'flex-end',
    flex       : 1,
    marginLeft : 40
  },
  value : {
    fontSize  : 16,
    color     : '#000',
    textAlign : 'right'
  },
  satsContainer : {
    flexDirection : 'row',
    alignItems    : 'baseline'
  },
  satsLabel : {
    fontSize   : 12,
    color      : '#666',
    marginLeft : 4
  },
  subtext : {
    fontSize  : 14,
    color     : '#666',
    marginTop : 4
  },
  bold : {
    fontWeight : '600'
  },
  totalRow : {
    marginTop      : 12,
    paddingTop     : 24,
    borderTopWidth : 1,
    borderTopColor : '#E5E5E5'
  },
  sendButton : {
    position        : 'absolute',
    bottom          : 40,
    left            : 20,
    right           : 20,
    height          : 56,
    backgroundColor : '#FF0000',
    borderRadius    : 28,
    alignItems      : 'center',
    justifyContent  : 'center'
  },
  sendButtonText : {
    color      : '#FFF',
    fontSize   : 16,
    fontWeight : '600'
  }
}) 