import React, { useState, useCallback, useMemo } from 'react'
import { View, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import TransactionSummaryFooter from '@/src/components/features/Send/Confirmation/TransactionSummaryFooter'
import { useSendNavigation } from '@/src/components/ui/Navigation/sendNavigation'
import { useTransactionParams } from '@/src/hooks/send/useTransactionParams'
import { transactionStyles } from '@/src/constants/transactionStyles'
import { useWalletStore } from '@/src/store/walletStore'
import { useAutoWalletSync } from '@/src/hooks/wallet/useAutoWalletSync'
import { ThemedText } from '@/src/components/ui/Text'
import { isValidBitcoinAddress } from '@/src/utils/validation/validateAddress'

/**
 * Screen for confirming transaction details before sending
 */
export default function SendConfirmScreen() {
  const { navigateBack, navigateToSendLoading } = useSendNavigation()
  const [ isValidating, setIsValidating ] = useState(false)
  
  useAutoWalletSync()
  
  const { 
    amount, 
    address, 
    feeSats,
    feeRate,
    currency, 
    totalAmount,
  } = useTransactionParams()

  const validationResult = useMemo(() => {
    // Get wallet and balances directly to avoid reactive updates
    const { wallet, balances } = useWalletStore.getState()
    
    if (!address || !amount || !wallet) {
      return { isValid: false, error: 'Missing required transaction data' }
    }

    if (!isValidBitcoinAddress(address)) {
      return { isValid: false, error: 'Invalid recipient address format' }
    }

    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' }
    }

    if (feeSats <= 0) {
      return { isValid: false, error: 'Invalid fee calculation' }
    }

    const totalNeededSats = currency === 'SATS' 
      ? Math.floor(totalAmount)
      : Math.floor(totalAmount * 100_000_000)
      
    if (totalNeededSats > balances.confirmed) {
      return { 
        isValid : false, 
        error   : `Insufficient balance. Need ${totalNeededSats} sats, have ${balances.confirmed} sats` 
      }
    }

    return { isValid: true, error: null }
  }, [ address, amount, currency, totalAmount, feeSats ])

  const handleSendPress = useCallback(async () => {
    if (!validationResult.isValid) {
      Alert.alert(
        'Transaction Error',
        validationResult.error || 'Unknown validation error',
        [ { text: 'OK' } ]
      )
      return
    }
    
    if (isValidating) {
      return
    }

    setIsValidating(true)
    
    try {
      const { balances } = useWalletStore.getState()
      
      console.log('Proceeding to send transaction:', {
        address,
        amount,
        currency,
        feeSats,
        feeRate,
        totalAmount,
        availableBalance : balances.confirmed
      })
      
      navigateToSendLoading()
      
    } catch (error) {
      console.error('Error preparing transaction:', error)
      Alert.alert(
        'Transaction Error',
        'Failed to prepare transaction. Please try again.',
        [ { text: 'OK' } ]
      )
    } finally {
      setIsValidating(false)
    }
  }, [ validationResult, isValidating, navigateToSendLoading, address, amount, currency, feeSats, feeRate, totalAmount ])

  // Get wallet state directly to avoid reactive updates
  const wallet = useWalletStore.getState().wallet

  if (!wallet) {
    return (
      <SafeAreaContainer style={transactionStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton onPress={navigateBack} />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ fontSize: 16, textAlign: 'center' }}>
            Loading wallet data...
          </ThemedText>
        </View>
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer style={transactionStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <BackButton onPress={navigateBack} />
      
      {!validationResult.isValid && (
        <View style={{ 
          margin          : 20, 
          padding         : 15, 
          backgroundColor : '#ffebee', 
          borderRadius    : 8,
          borderWidth     : 1,
          borderColor     : '#f44336'
        }}>
          <ThemedText style={{ color: '#d32f2f', fontSize: 14, textAlign: 'center' }}>
            ⚠️ {validationResult.error}
          </ThemedText>
        </View>
      )}
      
      {isValidating && (
        <View style={{ 
          margin          : 20, 
          padding         : 15, 
          backgroundColor : '#fff3e0', 
          borderRadius    : 8,
          borderWidth     : 1,
          borderColor     : '#ff9800'
        }}>
          <ThemedText style={{ color: '#f57c00', fontSize: 14, textAlign: 'center' }}>
            🔄 Preparing transaction...
          </ThemedText>
        </View>
      )}
      
      <TransactionSummaryFooter
        amount={amount}
        address={address}
        feeSats={feeSats}
        feeRate={feeRate}
        currency={currency}
        totalAmount={totalAmount}
        onSendPress={handleSendPress}
      />
    </SafeAreaContainer>
  )
} 