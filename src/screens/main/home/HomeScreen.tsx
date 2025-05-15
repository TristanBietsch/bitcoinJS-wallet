import React, { useState, useEffect, useMemo, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import Dropdown from '@/src/components/ui/Dropdown'
import BalanceDisplay from '@/src/components/features/Balance/BalanceDisplay'
import ActionButtons from '@/src/components/ui/Button/ActionButtons'
import { useFadeAnimation } from '@/src/hooks/ui/useFadeAnimation'
import { getAmountForCurrency } from '@/src/utils/formatting/currencyUtils'
import { formatCurrency } from '@/tests/mockData/walletData'
import { CURRENCY_OPTIONS, CurrencyType } from '@/src/config/currency'
import { SATS_PER_BTC } from '@/src/constants/currency'
import { useSendStore } from '@/src/store/sendStore'
import { useReceiveStore } from '@/src/store/receiveStore'
import { Colors } from '@/src/constants/colors'
import AppHeader from '@/src/components/ui/Header/AppHeader'
import { Scan } from 'lucide-react-native'
import { useWalletWithFocusRefresh } from '@/src/context/WalletContext'
import { useGlobalBitcoinPrice } from '@/src/context/PriceContext'

// Global cache for formatted balance to prevent blinking during navigation
const cachedBalanceState = {
  lastCurrency   : 'BTC' as CurrencyType,
  formattedValue : '',
  balanceValues  : {
    btcAmount  : 0,
    usdAmount  : 0,
    satsAmount : 0
  }
}

const HomeScreen = () => {
  // Track if this is initial mount to prevent visible loading on navigation
  const isInitialMount = useRef(true)

  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>(() => cachedBalanceState.lastCurrency)
  
  // State to track manual refresh vs background refresh
  const [ isManualRefresh, setIsManualRefresh ] = useState(false)
  
  // Use wallet context with focus refresh for seamless background updates
  const { 
    balances, 
    isBalanceLoading, 
    error: walletError, 
    refreshBalance,
  } = useWalletWithFocusRefresh()
  
  // Use price context for USD conversion - only extract what we need
  const { btcPrice, error: priceError } = useGlobalBitcoinPrice()
  
  // Use fade animation hook
  const { fadeAnim, fadeTransition } = useFadeAnimation()
  
  // Only show loading if it's an explicit manual refresh AND we're in initial mount
  // Never show loading when returning to the screen
  const isLoading = isManualRefresh && isBalanceLoading && isInitialMount.current
  
  // Combined error state
  const error = walletError || priceError
  
  // Get access to store reset functions
  const resetSendStore = useSendStore(state => state.reset)
  const resetReceiveStore = useReceiveStore(state => state.resetState)
  
  // Reset any stored send and receive data when component mounts
  // But only perform this once per app session
  useEffect(() => {
    resetSendStore()
    resetReceiveStore()
    
    // After first mount, we're no longer in initial state
    return () => {
      isInitialMount.current = false
    }
  }, [])
  
  // Calculated balance values - use useMemo to prevent recalculation on every render
  const balanceValues = useMemo(() => {
    // If we have a cached value and the balances haven't changed, use the cache
    if (cachedBalanceState.balanceValues.satsAmount === balances.total && 
        cachedBalanceState.balanceValues.btcAmount > 0) {
      return cachedBalanceState.balanceValues
    }
    
    // Otherwise calculate fresh values
    const btcAmount = balances.total / SATS_PER_BTC // Convert sats to BTC
    const usdAmount = btcPrice ? btcAmount * btcPrice : 0
    const satsAmount = balances.total
    
    // Update the cache
    const newValues = {
      btcAmount,
      usdAmount,
      satsAmount
    }
    cachedBalanceState.balanceValues = newValues
    
    return newValues
  }, [ balances.total, btcPrice ])
  
  // Handle currency change with animation
  const handleCurrencyChange = (value: string) => {
    const newCurrency = value as CurrencyType
    
    // Update the global cache
    cachedBalanceState.lastCurrency = newCurrency
    
    fadeTransition(() => {
      setCurrency(newCurrency)
    })
  }
  
  // Get and format the balance - also memoize to prevent recalculations
  const formattedBalance = useMemo(() => {
    // If we have a cached value for this currency, use it initially to prevent blinking
    if (cachedBalanceState.lastCurrency === currency && 
        cachedBalanceState.formattedValue && 
        !isManualRefresh) {
      // We'll still calculate a new value and update the cache
      setTimeout(() => {
        const newFormattedValue = formatCurrency(
          getAmountForCurrency(currency, balanceValues),
          currency
        )
        cachedBalanceState.formattedValue = newFormattedValue
      }, 0)
      
      return cachedBalanceState.formattedValue
    }
    
    // Calculate a new formatted value
    const newFormattedValue = formatCurrency(
      getAmountForCurrency(currency, balanceValues),
      currency
    )
    
    // Update the cache
    cachedBalanceState.formattedValue = newFormattedValue
    
    return newFormattedValue
  }, [ currency, balanceValues, isManualRefresh ])
  
  // Navigation handlers
  const handlePressSend = () => router.push('/send/send' as any)
  const handlePressReceive = () => router.push('/receive/receive' as any)
  
  // Handle menu press - Navigate to the menu screen
  const handleMenuPress = () => {
    router.push('/main/menu' as any)
  }

  // Handle scan button press - Navigate to QR menu screen
  const handleScanPress = () => {
    router.push('/main/qr' as any)
  }
  
  // Handle manual balance refresh (with visible loading)
  const handleManualRefresh = () => {
    setIsManualRefresh(true)
    refreshBalance(true).finally(() => {
      setIsManualRefresh(false)
    })
  }

  // Currency dropdown component
  const currencySelector = (
    <Dropdown
      options={CURRENCY_OPTIONS}
      selectedValue={currency}
      onSelect={handleCurrencyChange}
      title="Select Currency"
      cancelButtonLabel="Cancel"
      backgroundColor={Colors.light.buttons.primary}
      disabled={isLoading || !!error}
    />
  )

  // Scan button component
  const scanButton = (
    <TouchableOpacity onPress={handleScanPress} style={styles.scanButton}>
      <Scan size={24} color={Colors.light.text} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header with menu icon and scan button */}
      <AppHeader 
        showMenuIcon={true} 
        onMenuPress={handleMenuPress}
        leftComponent={scanButton}
      />
      
      {/* Balance Display Section with dropdown inside */}
      <BalanceDisplay
        isLoading={isLoading}
        error={error ? error.toString() : undefined}
        currency={currency}
        formattedBalance={formattedBalance}
        fadeAnim={fadeAnim}
        onRetry={handleManualRefresh}
        currencySelector={currencySelector}
      />
      
      {/* Action Buttons - Positioned above the navbar */}
      <View style={styles.actionButtonsWrapper}>
        <ActionButtons
          onPressSend={handlePressSend}
          onPressReceive={handlePressReceive}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : 'white',
    padding         : 0,
    paddingBottom   : 100,
  },
  actionButtonsWrapper : {
    position : 'absolute',
    bottom   : 160,
    left     : 0,
    right    : 0,
  },
  scanButton : {
    padding : 8,
  },
})

export default HomeScreen 