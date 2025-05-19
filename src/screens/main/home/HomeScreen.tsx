import React, { useState, useEffect, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import Dropdown from '@/src/components/ui/Dropdown'
import BalanceDisplay from '@/src/components/features/Balance/BalanceDisplay'
import ActionButtons from '@/src/components/ui/Button/ActionButtons'
import { useFadeAnimation } from '@/src/hooks/ui/useFadeAnimation'
import { getAmountForCurrency } from '@/src/utils/formatting/currencyUtils'
import { formatCurrency } from '@/src/utils/formatting/formatCurrencyValue'
import { CURRENCY_OPTIONS, CurrencyType } from '@/src/config/currency'
import { useSendStore } from '@/src/store/sendStore'
import { useReceiveStore } from '@/src/store/receiveStore'
import { Colors } from '@/src/constants/colors'
import AppHeader from '@/src/components/ui/Header/AppHeader'
import { Scan } from 'lucide-react-native'
import { useWalletBalance } from '@/src/hooks/wallet/useWalletBalance'
import { ThemedText } from '@/src/components/ui/Text'

const HomeScreen = () => {
  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>('BTC')
  
  // Use the combined hook for wallet balance and price data
  const { 
    satsAmount, 
    btcAmount, 
    isLoading: isDataLoading, // Combined loading from wallet and price
    error: dataError,       // Combined error
    refreshBalances: refreshAllData // Refetches both wallet and price
  } = useWalletBalance()
  
  // Use fade animation hook
  const { fadeAnim, fadeTransition } = useFadeAnimation()
  
  // We use the combined isLoading and error from the hook
  const isLoading = isDataLoading
  const error = dataError
  
  // Get access to store reset functions
  const resetSendStore = useSendStore(state => state.reset)
  const resetReceiveStore = useReceiveStore(state => state.resetState)
  
  useEffect(() => {
    resetSendStore()
    resetReceiveStore()
  }, [ resetSendStore, resetReceiveStore ])
  
  useFocusEffect(
    React.useCallback(() => {
      refreshAllData(true) // Use silent refresh to avoid UI flashing
      return () => {}
    }, [ refreshAllData ])
  )
  
  // balanceValues are now directly from the hook
  const balanceValues = useMemo(() => ({
    satsAmount,
    btcAmount
  }), [ satsAmount, btcAmount ])
  
  // Handle currency change with animation
  const handleCurrencyChange = (value: string) => {
    fadeTransition(() => {
      setCurrency(value as CurrencyType)
    })
  }
  
  // Get and format the balance (memoized to prevent unnecessary recalculations)
  const formattedBalance = useMemo(() => {
    const amount = getAmountForCurrency(currency, balanceValues)
    if (amount === 0) return '0' // Always show simple '0' for zero balance
    return formatCurrency(amount, currency)
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
    refreshAllData(false) // Use visible refresh for manual updates
  }

  // Currency dropdown component
  const currencySelector = (
    <Dropdown
      options={CURRENCY_OPTIONS}
      selectedValue={currency}
      onSelect={handleCurrencyChange}
      title="Display Balance As"
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

  // Show loading state if data is still loading on initial render
  if (isLoading && (!btcAmount && !satsAmount)) {
    return (
      <View style={styles.container}>
        <AppHeader 
          showMenuIcon={true} 
          onMenuPress={handleMenuPress}
          leftComponent={scanButton}
        />
        <View style={styles.loadingContainer}>
          <ThemedText>Loading wallet information...</ThemedText>
        </View>
      </View>
    )
  }

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
  loadingContainer : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
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