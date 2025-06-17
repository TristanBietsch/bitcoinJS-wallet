import React, { useState, useEffect, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import Dropdown from '@/src/components/ui/Dropdown'
import BalanceDisplay from '@/src/components/features/Balance/BalanceDisplay'
import ActionButtons from '@/src/components/ui/Button/ActionButtons'
import { useFadeAnimation } from '@/src/hooks/ui/useFadeAnimation'
import { formatCurrency } from '@/src/utils/formatting/formatCurrencyValue'
import { CURRENCY_OPTIONS, CurrencyType } from '@/src/config/currency'
import { useSendStore } from '@/src/store/sendStore'
import { useReceiveStore } from '@/src/store/receiveStore'
import { Colors } from '@/src/constants/colors'
import AppHeader from '@/src/components/ui/Header/AppHeader'
import { Scan } from 'lucide-react-native'
import { useWalletStore } from '@/src/store/walletStore'
import { ThemedText } from '@/src/components/ui/Text'
import { SATS_PER_BTC } from '@/src/constants/currency'

const HomeScreen = () => {
  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>('SATS')
  
  // Use wallet store directly for balance data
  const { 
    balances, 
    isSyncing, 
    error: walletError, 
    refreshWalletData 
  } = useWalletStore()
  
  // Convert balances to display format
  const satsAmount = balances.total
  const btcAmount = balances.total / SATS_PER_BTC
  
  // Use fade animation hook - use the fadeAnim value directly but not the fadeTransition function
  const { fadeAnim } = useFadeAnimation()
  
  // Use wallet sync state
  const isLoading = isSyncing
  const error = walletError
  
  // Get access to store reset functions
  const resetSendStore = useSendStore(state => state.reset)
  const resetReceiveStore = useReceiveStore(state => state.resetState)
  
  useEffect(() => {
    resetSendStore()
    resetReceiveStore()
  }, [ resetSendStore, resetReceiveStore ])
  
  useFocusEffect(
    React.useCallback(() => {
      refreshWalletData(true) // Use silent refresh to avoid UI flashing
      return () => {}
    }, [ refreshWalletData ])
  )
  
  // Handle currency change with animation
  const handleCurrencyChange = (value: string) => {
    // First fade out
    Animated.timing(fadeAnim, {
      toValue         : 0.3,
      duration        : 150,
      useNativeDriver : true
    }).start(() => {
      // Update currency while faded out
      setCurrency(value as CurrencyType)
      
      // Then fade back in
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue         : 1,
          duration        : 150,
          useNativeDriver : true
        }).start()
      }, 50) // Small delay to ensure the new value is rendered
    })
  }
  
  // Get and format the balance (memoized to prevent unnecessary recalculations)
  const formattedBalance = useMemo(() => {
    // Always use the btcAmount as the source of truth
    // Regardless of which currency is selected for display, we use the same value source
    // and let the formatCurrency function handle the conversion and formatting
    if (btcAmount === 0) return '0' // Always show simple '0' for zero balance
    
    if (currency === 'BTC') {
      return formatCurrency(btcAmount, 'BTC')
    } else {
      // When displaying SATS, we convert from BTC to SATS and format
      return formatCurrency(btcAmount * SATS_PER_BTC, 'SATS')
    }
  }, [ currency, btcAmount ])
  
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
    refreshWalletData(false) // Use visible refresh for manual updates
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