import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

// Import modularized components
import ReceiveScreenLayout from '@/src/components/layout/ReceiveScreenLayout'
import PrimaryActionButton from '@/src/components/ui/Button/PrimaryActionButton'
import AmountDisplay from '@/src/components/ui/AmountDisplay'
import NumberPad from '@/src/components/ui/NumberPad'

// Import hooks and stores
import { useReceiveStore } from '@/src/store/receiveStore'
import { useBitcoinPrice } from '@/src/hooks/bitcoin/useBitcoinPrice'

export default function ReceiveScreen() {
  const router = useRouter()
  
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
  
  // Dummy balance for display
  const balance = '$2,257.65'
  
  // Navigate back to home
  const handleBackPress = () => {
    router.push('/')
  }
  
  const handleGenerateQR = () => {
    router.push({
      pathname : '/receive/invoice' as any,
      params   : {
        amount,
        currency
      }
    })
  }
  
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