import React, { useState, useEffect } from 'react'
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
import { useWallet } from '@/src/context/WalletContext'
import { useGlobalBitcoinPrice } from '@/src/context/PriceContext'

const HomeScreen = () => {
  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>('BTC')
  
  // Use wallet context for real wallet data
  const { balances, isLoading: isWalletLoading, error: walletError, refreshBalance } = useWallet()
  
  // Use price context for USD conversion
  const { btcPrice, isLoading: isPriceLoading, error: priceError } = useGlobalBitcoinPrice()
  
  // Use fade animation hook
  const { fadeAnim, fadeTransition } = useFadeAnimation()
  
  // Combined loading state
  const isLoading = isWalletLoading || isPriceLoading
  
  // Combined error state
  const error = walletError || priceError
  
  // Get access to store reset functions
  const resetSendStore = useSendStore(state => state.reset)
  const resetReceiveStore = useReceiveStore(state => state.resetState)
  
  // Reset any stored send and receive data when component mounts
  useEffect(() => {
    resetSendStore()
    resetReceiveStore()
  }, [])
  
  // Calculated balance values
  const btcAmount = balances.total / SATS_PER_BTC // Convert sats to BTC
  const usdAmount = btcPrice ? btcAmount * btcPrice : 0
  const satsAmount = balances.total
  
  // Handle currency change with animation
  const handleCurrencyChange = (value: string) => {
    fadeTransition(() => {
      setCurrency(value as CurrencyType)
    })
  }
  
  // Get and format the balance
  const formattedBalance = formatCurrency(
    getAmountForCurrency(currency, { usdAmount, btcAmount, satsAmount }),
    currency
  )
  
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
        onRetry={refreshBalance}
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