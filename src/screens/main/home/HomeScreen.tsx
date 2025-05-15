import React, { useState, useEffect, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
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
import { useGlobalBitcoinPrice } from '@/src/context/PriceContext'
import { useWalletBalance } from '@/src/store/walletStore'

const HomeScreen = () => {
  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>('BTC')
  
  // Use our Zustand store instead of context
  // Get only what we need, minimizing re-renders
  const { balances, error: walletError, refreshBalance } = useWalletBalance()
  
  // Manual refresh state (only for explicit user-triggered refresh)
  const [ isManualRefresh, setIsManualRefresh ] = useState(false)
  
  // Use price context for USD conversion
  const { btcPrice, isLoading: isPriceLoading, error: priceError } = useGlobalBitcoinPrice()
  
  // Use fade animation hook
  const { fadeAnim, fadeTransition } = useFadeAnimation()
  
  // Combined error state
  const error = walletError || priceError
  
  // We only show a loading indicator during price fetching or manual refresh
  // Balance updates happen silently in the background with no UI flicker
  const isLoading = isPriceLoading || isManualRefresh
  
  // Get access to store reset functions
  const resetSendStore = useSendStore(state => state.reset)
  const resetReceiveStore = useReceiveStore(state => state.resetState)
  
  // Reset any stored send and receive data when component mounts
  useEffect(() => {
    resetSendStore()
    resetReceiveStore()
  }, [])
  
  // Background refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Silent refresh (no loading indicator)
      refreshBalance(true)
      return () => {}
    }, [ refreshBalance ])
  )
  
  // Calculated balance values (using useMemo to prevent recalculations)
  const balanceValues = useMemo(() => {
    const btcAmount = balances.total / SATS_PER_BTC // Convert sats to BTC
    const usdAmount = btcPrice ? btcAmount * btcPrice : 0
    const satsAmount = balances.total
    
    return {
      btcAmount,
      usdAmount,
      satsAmount
    }
  }, [ balances.total, btcPrice ])
  
  // Handle currency change with animation
  const handleCurrencyChange = (value: string) => {
    fadeTransition(() => {
      setCurrency(value as CurrencyType)
    })
  }
  
  // Get and format the balance (memoized to prevent unnecessary recalculations)
  const formattedBalance = useMemo(() => {
    return formatCurrency(
      getAmountForCurrency(currency, balanceValues),
      currency
    )
  }, [ currency, balanceValues ])
  
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
    refreshBalance(false).finally(() => {
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