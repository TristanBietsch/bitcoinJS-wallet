import React, { useState, useCallback, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Stack, useRouter } from 'expo-router'

import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import ScreenFooter from '@/src/components/layout/ScreenFooter'
import ActionButton from '@/src/components/ui/Button/ActionButton'
import NumberPad from '@/src/components/ui/NumberPad'
import AmountEntrySection from '@/src/components/features/Send/Amount/AmountEntrySection'
import { ThemedText } from '@/src/components/ui/Text'
import { useTransaction } from '@/src/hooks/send/useTransaction'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { useWalletStore } from '@/src/store/walletStore'
import { useAutoWalletSync } from '@/src/hooks/wallet/useAutoWalletSync'
import type { CurrencyType } from '@/src/types/domain/finance'

export default function SendAmountScreen() {
  const router = useRouter()
  const { validation, fees } = useTransaction()
  
  // Auto-sync wallet data
  useAutoWalletSync()
  
  // Transaction store state and actions
  const {
    inputs: { amount, currency },
    derived: { amountSats, amountError },
    meta: { isLoadingUtxos, isCalculatingFee },
    setAmount,
    setCurrency,
    validateAmount
  } = useSendTransactionStore()
  
  // Wallet store for balance
  const { balances, isSyncing: isLoadingBalance } = useWalletStore()
  
  // Local loading state for amount validation
  const [ isValidating, setIsValidating ] = useState(false)
  
  // Format satoshis for display
  const formatSats = (sats: number): string => {
    return sats.toLocaleString() + ' sats'
  }
  
  // Handle currency change
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setCurrency(newCurrency as CurrencyType)
  }, [ setCurrency ])
  
  // Handle number input
  const handleNumberPress = useCallback((digit: string) => {
    const currentAmount = amount || '0'
    
    // Handle decimal point for BTC
    if (digit === '.' && currency === 'BTC') {
      if (currentAmount.includes('.')) return // Already has decimal
      setAmount(currentAmount + '.', currency)
      return
    }
    
    // Handle regular digits
    if (digit === '.' && currency === 'SATS') return // No decimals for sats
    
    let newAmount = currentAmount === '0' ? digit : currentAmount + digit
    
    // Prevent invalid BTC amounts (more than 8 decimal places)
    if (currency === 'BTC' && newAmount.includes('.')) {
      const [ , decimals ] = newAmount.split('.')
      if (decimals && decimals.length > 8) return
    }
    
    setAmount(newAmount, currency)
  }, [ amount, currency, setAmount ])
  
  // Handle backspace
  const handleBackspace = useCallback(() => {
    const currentAmount = amount || '0'
    
    if (currentAmount.length <= 1) {
      setAmount('0', currency)
    } else {
      const newAmount = currentAmount.slice(0, -1)
      setAmount(newAmount || '0', currency)
    }
  }, [ amount, currency, setAmount ])
  
  // Handle back navigation
  const handleBackPress = useCallback(() => {
    router.back()
  }, [ router ])
  
  // Handle continue to next screen
  const handleContinue = useCallback(async () => {
    setIsValidating(true)
    
    try {
      // Validate amount
      validateAmount()
      
      // Load UTXOs and calculate fees for this amount
      await fees.loadUtxosAndCalculateFees()
      
      // Navigate to confirmation screen
      router.push('/send/confirm')
    } catch (error) {
      console.error('Error preparing transaction:', error)
      // Error handling is managed by the transaction store
    } finally {
      setIsValidating(false)
    }
  }, [ validateAmount, fees, router ])
  
  // Check if user can proceed to next screen
  const canProceedToNext = useCallback(() => {
    if (!amount || amount === '0') return false
    if (amountError) return false
    if (isValidating || isLoadingUtxos || isCalculatingFee) return false
    
    // Basic amount validation
    const amountValidation = validation.validateAmount(amountSats)
    if (!amountValidation.isValid) return false
    
    // Check if amount exceeds balance
    if (amountSats > balances.confirmed) return false
    
    return true
  }, [ amount, amountSats, amountError, isValidating, isLoadingUtxos, isCalculatingFee, validation, balances ])

  // Auto-validate amount when it changes
  useEffect(() => {
    if (amount && amount !== '0') {
      const timer = setTimeout(() => {
        validateAmount()
      }, 500) // Debounce validation
      
      return () => clearTimeout(timer)
    }
  }, [ amount, validateAmount ])

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
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Bitcoin Information Section */}
      <View style={styles.infoSection}>
        {/* Wallet Balance */}
        <View style={styles.balanceContainer}>
          <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
          {isLoadingBalance ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <ThemedText style={styles.loadingText}>Loading balance...</ThemedText>
            </View>
          ) : (
            <View style={styles.balanceInfo}>
              <ThemedText style={styles.balanceAmount}>
                {formatSats(balances.confirmed)}
              </ThemedText>
              {balances.unconfirmed > 0 && (
                <ThemedText style={styles.unconfirmedBalance}>
                  +{formatSats(balances.unconfirmed)} pending
                </ThemedText>
              )}
            </View>
          )}
        </View>
        
        {/* Amount Error Display */}
        {amountError && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>⚠️ {amountError}</ThemedText>
          </View>
        )}
        
        {/* Insufficient Balance Warning */}
        {amountSats > 0 && amountSats > balances.confirmed && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              ⚠️ Insufficient balance. You need {formatSats(amountSats - balances.confirmed)} more.
            </ThemedText>
          </View>
        )}
      </View>
      
      {/* Footer with Continue Button and Number Pad */}
      <ScreenFooter withBorder={false}>
        {/* Continue Button */}
        <ActionButton
          title={isValidating || isLoadingUtxos || isCalculatingFee ? "Preparing..." : "Continue"}
          onPress={handleContinue}
          disabled={!canProceedToNext()}
          style={{ 
            marginBottom : 40,
            borderRadius : 30,
            opacity      : !canProceedToNext() ? 0.5 : 1
          }}
        />
        
        {/* Loading Indicator for Transaction Preparation */}
        {(isValidating || isLoadingUtxos || isCalculatingFee) && (
          <View style={styles.preparingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <ThemedText style={styles.preparingText}>
              {isLoadingUtxos && "Loading wallet data..."}
              {isCalculatingFee && "Calculating fees..."}
              {isValidating && "Validating amount..."}
            </ThemedText>
          </View>
        )}
        
        {/* Number Pad */}
        <NumberPad
          onNumberPress={handleNumberPress}
          onBackspace={handleBackspace}
        />
      </ScreenFooter>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  infoSection : {
    paddingHorizontal : 20,
    paddingVertical   : 16,
    marginTop         : 20,
  },
  balanceContainer : {
    backgroundColor : '#f8f9fa',
    borderRadius    : 12,
    padding         : 16,
    marginBottom    : 12,
  },
  balanceLabel : {
    fontSize     : 14,
    color        : '#666',
    marginBottom : 4,
  },
  balanceInfo : {
    flexDirection : 'row',
    alignItems    : 'baseline',
  },
  balanceAmount : {
    fontSize   : 18,
    fontWeight : '600',
    color      : '#000',
  },
  unconfirmedBalance : {
    fontSize   : 14,
    color      : '#ffa726',
    marginLeft : 8,
    fontStyle  : 'italic',
  },
  loadingContainer : {
    flexDirection : 'row',
    alignItems    : 'center',
  },
  loadingText : {
    fontSize   : 16,
    color      : '#666',
    marginLeft : 8,
  },
  errorContainer : {
    backgroundColor : '#ffebee',
    borderRadius    : 8,
    padding         : 12,
    marginBottom    : 8,
    borderWidth     : 1,
    borderColor     : '#f44336',
  },
  errorText : {
    color     : '#d32f2f',
    fontSize  : 14,
    textAlign : 'center',
  },
  preparingContainer : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
    marginBottom   : 20,
  },
  preparingText : {
    fontSize   : 14,
    color      : '#007AFF',
    marginLeft : 8,
  },
}) 