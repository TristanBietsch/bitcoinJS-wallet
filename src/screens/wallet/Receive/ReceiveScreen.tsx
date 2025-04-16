import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import { ChevronLeft } from 'lucide-react-native'

// Imported components and utilities from our modularized code
import AmountDisplay from '@/src/components/ui/AmountDisplay'
import NumberPad from '@/src/components/ui/NumberPad'
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
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown : false, // Hide the navigation bar completely
        }} 
      />
      
      {/* Custom Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>
      
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
        {/* Generate QR Button */}
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleGenerateQR}
        >
          <ThemedText style={styles.continueButtonText}>Generate QR Code</ThemedText>
        </TouchableOpacity>
        
        {/* Number Pad - now using our modularized component */}
        <NumberPad
          onNumberPress={handleNumberPress}
          onBackspace={handleBackspace}
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
  },
  backButton : {
    position       : 'absolute',
    top            : 70,
    left           : 16,
    zIndex         : 10,
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    justifyContent : 'center',
    alignItems     : 'center',
  },
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
  continueButton : {
    backgroundColor  : 'red',
    paddingVertical  : 16,
    borderRadius     : 30,
    marginBottom     : 40,
    marginHorizontal : 24,
    alignItems       : 'center',
  },
  continueButtonText : {
    color      : 'white',
    fontSize   : 16,
    fontWeight : 'bold',
  },
}) 