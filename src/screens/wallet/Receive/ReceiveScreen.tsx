import React from 'react'
import { View, StyleSheet } from 'react-native'

// Import modularized components
import ReceiveScreenLayout from '@/src/components/layout/ReceiveScreenLayout'
import PrimaryActionButton from '@/src/components/ui/Button/PrimaryActionButton'
import AmountDisplay from '@/src/components/ui/AmountDisplay'
import NumberPad from '@/src/components/ui/NumberPad'

// Import hooks and stores
import { useReceiveStore } from '@/src/store/receiveStore'
import { useBitcoinPrice } from '@/src/hooks/bitcoin/useBitcoinPrice'
import { useReceiveHandlers } from '@/src/handlers/receiveHandlers'
import { getWalletBalanceDisplay } from '@/src/utils/mockData/walletMockData'

export default function ReceiveScreen() {
  // Use our custom hook for Bitcoin price
  const { btcPrice, isLoading } = useBitcoinPrice()
  
  // Use our store for state management
  const { 
    amount, 
    currency, 
    handleNumberPress, 
    handleBackspace, 
    handleCurrencyChange 
  } = useReceiveStore()
  
  // Use handlers for receive operations
  const { handleBackPress, handleGenerateQR, isAmountValid } = useReceiveHandlers()
  
  // Get mock balance for display from our mock data
  const balance = getWalletBalanceDisplay()
  
  return (
    <ReceiveScreenLayout onBackPress={handleBackPress}>
      {/* Amount Display - now using our modularized component */}
      <View style={styles.amountContainer}>
        <AmountDisplay
          amount={amount}
          currency={currency}
          balance={balance}
          isLoading={isLoading}
          onCurrencyChange={(newCurrency) => handleCurrencyChange(newCurrency, btcPrice)}
        />
      </View>
      
      <View style={styles.footerContainer}>
        {/* Generate QR Button Container */}
        <View style={styles.buttonContainer}>
          <PrimaryActionButton
            label="Generate Invoice"
            onPress={handleGenerateQR}
            style={styles.continueButton}
            disabled={!isAmountValid()}
          />
        </View>
        
        {/* Number Pad - using modularized component */}
        <NumberPad
          onNumberPress={handleNumberPress}
          onBackspace={handleBackspace}
        />
      </View>
    </ReceiveScreenLayout>
  )
}

const styles = StyleSheet.create({
  amountContainer : {
    flex           : 0,
    justifyContent : 'flex-start',
    alignItems     : 'center',
    paddingTop     : 120,
    marginBottom   : 20,
  },
  footerContainer : {
    position      : 'absolute',
    bottom        : 0,
    left          : 0,
    right         : 0,
    paddingBottom : 32,
  },
  buttonContainer : {
    flexDirection  : 'row',
    justifyContent : 'center',
    width          : '100%',
  },
  continueButton : {
    width            : 250,
    marginBottom     : 40,
    marginHorizontal : 0,
  },
}) 