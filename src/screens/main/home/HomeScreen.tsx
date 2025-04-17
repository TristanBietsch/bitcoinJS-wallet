import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useWalletBalance } from '@/src/hooks/wallet/useWalletBalance'
import Dropdown from '@/src/components/ui/Dropdown'
import BalanceDisplay from '@/src/components/features/Balance/BalanceDisplay'
import ActionButtons from '@/src/components/ui/Button/ActionButtons'
import { useFadeAnimation } from '@/src/hooks/ui/useFadeAnimation'
import { getAmountForCurrency } from '@/src/utils/formatting/currencyUtils'
import { formatCurrency } from '@/tests/mockData/walletData'
import { CURRENCY_OPTIONS, CurrencyType } from '@/src/config/currency'
import { useSendStore } from '@/src/store/sendStore'
import { useReceiveStore } from '@/src/store/receiveStore'

const HomeScreen = () => {
  // State for selected currency format
  const [ currency, setCurrency ] = useState<CurrencyType>('BTC')
  
  // Use wallet balance hook
  const { btcAmount, usdAmount, satsAmount, isLoading, error, refetch } = useWalletBalance()
  
  // Use fade animation hook
  const { fadeAnim, fadeTransition } = useFadeAnimation()
  
  // Get access to store reset functions
  const resetSendStore = useSendStore(state => state.reset)
  const resetReceiveStore = useReceiveStore(state => state.resetState)
  
  // Reset any stored send and receive data when component mounts
  useEffect(() => {
    resetSendStore()
    resetReceiveStore()
  }, [])
  
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

  // Currency dropdown component
  const currencySelector = (
    <Dropdown
      options={CURRENCY_OPTIONS}
      selectedValue={currency}
      onSelect={handleCurrencyChange}
      title="Select Currency"
      cancelButtonLabel="Cancel"
      backgroundColor="red"
      disabled={isLoading || !!error}
    />
  )

  return (
    <View style={styles.container}>
      {/* Balance Display Section with dropdown inside */}
      <BalanceDisplay
        isLoading={isLoading}
        error={error ? error.toString() : undefined}
        currency={currency}
        formattedBalance={formattedBalance}
        fadeAnim={fadeAnim}
        onRetry={refetch}
        currencySelector={currencySelector}
      />
      
      {/* Action Buttons */}
      <ActionButtons
        onPressSend={handlePressSend}
        onPressReceive={handlePressReceive}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : 'white',
    padding         : 20,
    paddingBottom   : 100,
  },
})

export default HomeScreen 