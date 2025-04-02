import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Platform } from 'react-native'
import { router } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import { formatCurrency } from '@/tests/mockData/walletData'
import { useWalletBalance } from '@/src/hooks/wallet/useWalletBalance'
import Dropdown from '@/src/components/ui/Dropdown'

// Currency options for the dropdown
const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'BTC', value: 'BTC' },
  { label: 'SATS', value: 'SATS' },
]

// Currency type definition
type CurrencyType = 'USD' | 'BTC' | 'SATS';

const HomeScreen = () => {
  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>('BTC')
  
  // Use wallet balance hook
  const { btcAmount, usdAmount, satsAmount, isLoading, error, refetch } = useWalletBalance()
  
  // Animated value for fade effect
  const fadeAnim = useState(new Animated.Value(1))[0]
  
  // Handle currency change with animation
  const handleCurrencyChange = (value: string) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue         : 0,
      duration        : 150,
      useNativeDriver : true,
    }).start(() => {
      // Change currency
      setCurrency(value as CurrencyType)
      
      // Fade back in
      Animated.timing(fadeAnim, {
        toValue         : 1,
        duration        : 150,
        useNativeDriver : true,
      }).start()
    })
  }
  
  // Get the appropriate amount based on selected currency
  const getAmountForCurrency = () => {
    switch(currency) {
      case 'USD':
        return usdAmount
      case 'BTC':
        return btcAmount
      case 'SATS':
        return satsAmount
      default:
        return usdAmount
    }
  }
  
  // Format the balance based on selected currency
  const formattedBalance = formatCurrency(getAmountForCurrency(), currency)

  // Render the balance display
  const renderBalanceDisplay = () => {
    if (currency === 'SATS') {
      return (
        <View style={styles.balanceRow}>
          <ThemedText style={styles.balanceAmount}>
            {formattedBalance}
          </ThemedText>
          <ThemedText style={styles.satsLabel}>
            Sats
          </ThemedText>
        </View>
      )
    } else {
      return (
        <ThemedText style={styles.balanceAmount}>
          {formattedBalance}
        </ThemedText>
      )
    }
  }

  return (
    <View style={styles.container}>
      
      {/* Balance Display Section */}
      <View style={styles.balanceContainer}>
        <ThemedText type="default" style={styles.balanceLabel}>
          Current Balance:
        </ThemedText>
        
        {isLoading ? (
          <ActivityIndicator testID="activity-indicator" size="large" color="red" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={[ styles.balanceDisplayContainer, { opacity: fadeAnim } ]}>
            {renderBalanceDisplay()}
          </Animated.View>
        )}
        
        {/* Currency Selector - Platform specific */}
        <View style={styles.dropdownContainer}>
          {Platform.OS === 'ios' ? (
            <Dropdown
              options={CURRENCY_OPTIONS}
              selectedValue={currency}
              onSelect={handleCurrencyChange}
              title="Select Currency"
              cancelButtonLabel="Cancel"
              backgroundColor="red"
              disabled={isLoading || !!error}
            />
          ) : (
            <Dropdown
              options={CURRENCY_OPTIONS}
              selectedValue={currency}
              onSelect={handleCurrencyChange}
              placeholder="Select Currency"
              backgroundColor="red"
            />
          )}
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/send/send' as any)}
        >
          <ThemedText style={styles.actionButtonText}>Send</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/receive/receive' as any)}
        >
          <ThemedText style={styles.actionButtonText}>Receive</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : 'white',
    padding         : 20,
  },
  topRightIcon : {
    position        : 'absolute',
    top             : 20,
    right           : 20,
    width           : 24,
    height          : 24,
    backgroundColor : '#E0E0E0',
    borderRadius    : 4,
  },
  balanceContainer : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  balanceLabel : {
    fontSize     : 16,
    marginBottom : 8,
  },
  balanceAmount : {
    fontSize     : 48,
    fontWeight   : 'bold',
    marginBottom : 16,
  },
  balanceRow : {
    flexDirection : 'row',
    alignItems    : 'baseline',
  },
  satsLabel : {
    fontSize   : 24,
    fontWeight : 'normal',
    marginLeft : 6,
  },
  dropdownContainer : {
    marginVertical : 16,
    zIndex         : 10,
  },
  actionButtonsContainer : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 80,
  },
  actionButton : {
    backgroundColor : 'red',
    borderRadius    : 30,
    width           : '48%',
    paddingVertical : 16,
    alignItems      : 'center',
  },
  actionButtonText : {
    color      : 'white',
    fontWeight : 'bold',
    fontSize   : 18,
  },
  loader : {
    marginVertical : 20,
  },
  errorContainer : {
    alignItems   : 'center', 
    marginBottom : 16,
  },
  errorText : {
    color        : 'red',
    marginBottom : 8,
  },
  retryButton : {
    backgroundColor   : '#f0f0f0',
    paddingVertical   : 6,
    paddingHorizontal : 12,
    borderRadius      : 4,
  },
  retryText : {
    color : 'black',
  },
  balanceDisplayContainer : {
    opacity        : 1,
    height         : 80,
    justifyContent : 'center',
    alignItems     : 'center',
  },
})

export default HomeScreen 