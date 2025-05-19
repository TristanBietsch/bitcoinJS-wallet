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
import { useWalletStore } from '@/src/store/walletStore'
import { ThemedText } from '@/src/components/ui/Text'
import { OnboardingButton } from '@/src/components/ui/Button'

const HomeScreen = () => {
  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>('BTC')
  
  const appWallet = useWalletStore(state => state.wallet)
  
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
    // Initialize price fetching when the component mounts, if not already started
    // usePriceStore.getState().initializePriceFetching() // This is now in _layout.tsx
  }, [ resetSendStore, resetReceiveStore ]) // Removed price store init
  
  useFocusEffect(
    React.useCallback(() => {
      refreshAllData() // Refreshes both price and balance silently by default from hook logic
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
    refreshAllData() // This now refreshes both wallet balance and price
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

  if (!appWallet && isDataLoading === false) {
    return (
      <View style={styles.containerNoWallet}> 
        <AppHeader 
          showMenuIcon={true} 
          onMenuPress={handleMenuPress}
          leftComponent={scanButton}
        />
        <View style={styles.noWalletContent}>
          <ThemedText style={styles.noWalletTitle}>No Wallet Found</ThemedText>
          <ThemedText style={styles.noWalletText}>
            Please create a new wallet or import an existing one to get started.
          </ThemedText>
          <OnboardingButton 
            label="Go to Setup"
            onPress={() => router.replace('/onboarding' as any)}
            style={{marginTop: 20, width: '80%'}}
          />
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
  containerNoWallet : {
    flex            : 1,
    backgroundColor : 'white',
  },
  noWalletContent : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
    padding        : 20,
  },
  noWalletTitle : {
    fontSize     : 22,
    fontWeight   : 'bold',
    marginBottom : 16,
    textAlign    : 'center',
  },
  noWalletText : {
    fontSize     : 16,
    textAlign    : 'center',
    opacity      : 0.7,
    marginBottom : 24,
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