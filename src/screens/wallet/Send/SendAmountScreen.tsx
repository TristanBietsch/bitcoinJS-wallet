import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import { ChevronLeft } from 'lucide-react-native'
import { AmountDisplay } from '@/src/components/features/Send/Address/AmountDisplay'
import { CurrencySelector, NumberPad } from '@/src/components/features/Send/Amount'
import { useSendAmount } from '@/src/hooks/send/useSendAmount'

export default function SendAmountScreen() {
  const {
    amount,
    currency,
    balance,
    isLoading,
    handleCurrencyChange,
    handleNumberPress,
    handleBackspace,
    handleBackPress,
    handleContinue
  } = useSendAmount()

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />
      
      {/* Custom Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>
      
      {/* Amount Display */}
      <AmountDisplay
        amount={amount}
        currency={currency}
        balance={balance}
      />
      
      {/* Currency Selector */}
      <CurrencySelector
        currency={currency}
        isLoading={isLoading}
        onCurrencyChange={handleCurrencyChange}
      />
      
      <View style={styles.footerContainer}>
        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
        </TouchableOpacity>
        
        {/* Number Pad */}
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