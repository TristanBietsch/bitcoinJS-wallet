import React from 'react'
import { Stack } from 'expo-router'

import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import ScreenFooter from '@/src/components/layout/ScreenFooter'
import ActionButton from '@/src/components/ui/Button/ActionButton'
import NumberPad from '@/src/components/ui/NumberPad'
import AmountEntrySection from '@/src/components/features/Send/Amount/AmountEntrySection'
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

  // Convert amount to number and check if it's 0 or empty
  const isAmountZero = !amount || Number(amount.replace(/[^0-9.]/g, '')) === 0

  return (
    <SafeAreaContainer>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />
      
      {/* Custom Back Button */}
      <BackButton onPress={handleBackPress} />
      
      {/* Amount Entry Section */}
      <AmountEntrySection
        amount={amount}
        currency={currency}
        balance={balance}
        isLoading={isLoading}
        onCurrencyChange={handleCurrencyChange}
      />
      
      {/* Footer with Continue Button and Number Pad */}
      <ScreenFooter withBorder={false}>
        {/* Continue Button */}
        <ActionButton
          title="Continue"
          onPress={handleContinue}
          disabled={isAmountZero}
          style={{ 
            marginBottom : 40,
            borderRadius : 30,
            opacity      : isAmountZero ? 0.5 : 1
          }}
        />
        
        {/* Number Pad */}
        <NumberPad
          onNumberPress={handleNumberPress}
          onBackspace={handleBackspace}
        />
      </ScreenFooter>
    </SafeAreaContainer>
  )
} 