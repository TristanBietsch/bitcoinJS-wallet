import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { View, Alert, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import TransactionSummaryFooter from '@/src/components/features/Send/Confirmation/TransactionSummaryFooter'
import { useSendNavigation } from '@/src/components/ui/Navigation/sendNavigation'
import { useTransaction } from '@/src/hooks/send/useTransaction'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { transactionStyles } from '@/src/constants/transactionStyles'
import { useWalletStore } from '@/src/store/walletStore'
import { useAutoWalletSync } from '@/src/hooks/wallet/useAutoWalletSync'
import { ThemedText } from '@/src/components/ui/Text'

/**
 * Screen for confirming transaction details before sending
 * Uses the new unified transaction architecture
 */
export default function SendConfirmScreen() {
  const { navigateBack } = useSendNavigation()
  const [ isValidating, setIsValidating ] = useState(false)
  const [ isLoadingTransaction, setIsLoadingTransaction ] = useState(true)
  const [ loadingError, setLoadingError ] = useState<string | null>(null)
  
  useAutoWalletSync()
  
  // Get transaction data from stores and hooks
  const transactionStore = useSendTransactionStore()
  const { validation, actions } = useTransaction()
  
  // Load transaction data when screen loads
  useEffect(() => {
    const loadTransactionData = async () => {
      try {
        setIsLoadingTransaction(true)
        setLoadingError(null)
        
        // Load UTXOs and calculate fees directly from service
        const { SendTransactionService } = await import('@/src/services/sendTransactionService')
        await SendTransactionService.loadUtxosAndCalculateFees()
        
        setIsLoadingTransaction(false)
      } catch (error) {
        console.error('Failed to load transaction data:', error)
        setLoadingError(error instanceof Error ? error.message : 'Failed to load transaction data')
        setIsLoadingTransaction(false)
      }
    }
    
    loadTransactionData()
  }, []) // Empty dependency array - run only once

  // Get transaction parameters
  const address = transactionStore.inputs.recipientAddress
  const amount = transactionStore.derived.amountSats
  const currency = transactionStore.inputs.currency
  const feeSats = transactionStore.derived.estimatedFee
  const feeRate = transactionStore.inputs.feeRate
  const totalAmount = transactionStore.derived.totalSats

  const validationResult = useMemo(() => {
    // Get wallet and balances directly to avoid reactive updates
    const { wallet, balances } = useWalletStore.getState()
    
    if (!address || !amount || !wallet) {
      return { isValid: false, error: 'Missing required transaction data' }
    }

    // Use the validation utility from useTransaction
    const addressValidation = validation.validateAddress(address)
    if (!addressValidation.isValid) {
      return { 
        isValid : false, 
        error   : addressValidation.error || 'Invalid recipient address'
      }
    }

    const amountValidation = validation.validateAmount(amount)
    if (!amountValidation.isValid) {
      return { 
        isValid : false, 
        error   : amountValidation.error || 'Invalid amount'
      }
    }

    const feeValidation = validation.validateFeeRate(feeRate)
    if (!feeValidation.isValid) {
      return { 
        isValid : false, 
        error   : feeValidation.error || 'Invalid fee rate'
      }
    }
      
    if (totalAmount > balances.confirmed) {
      return { 
        isValid : false, 
        error   : `Insufficient balance. Need ${totalAmount} sats, have ${balances.confirmed} sats`
      }
    }

    // Check if transaction is ready
    if (!validation.isTransactionReady()) {
      return {
        isValid : false,
        error   : 'Transaction is not ready. Please check all inputs.'
      }
    }

    return { 
      isValid : true, 
      error   : null
    }
  }, [ address, amount, totalAmount, feeRate, validation ])

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
      console.log('Executing transaction:', {
        address,
        amount,
        currency,
        feeSats,
        feeRate,
        totalAmount
      })
      
      // Execute transaction using the unified hook
      const result = await actions.executeTransaction()
      
      if (result) {
        // Transaction successful - navigate to success
        actions.navigateToSuccess(result.txid)
      } else {
        // Transaction failed but no error thrown
        Alert.alert(
          'Transaction Failed',
          'Failed to send transaction. Please try again.',
          [ { text: 'OK' } ]
        )
      }
      
    } catch (error) {
      console.error('Transaction execution failed:', error)
      
      // Let the transaction hook handle error navigation
      if (error instanceof Error) {
        const errorMessage = error.message || 'Unknown error occurred'
        Alert.alert(
          'Transaction Error',
          errorMessage,
          [ { text: 'OK' } ]
        )
      }
    } finally {
      setIsValidating(false)
    }
  }, [ validationResult, isValidating, actions, address, amount, currency, feeSats, feeRate, totalAmount ])

  // Get wallet state directly to avoid reactive updates
  const wallet = useWalletStore.getState().wallet

  // Show loading state while preparing transaction
  if (!wallet || isLoadingTransaction) {
    return (
      <SafeAreaContainer style={transactionStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton onPress={navigateBack} />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 16 }} />
          <ThemedText style={{ fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
            {!wallet ? 'Loading wallet data...' : 'Loading transaction data...'}
          </ThemedText>
          {isLoadingTransaction && (
            <ThemedText style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
              Calculating fees and preparing transaction
            </ThemedText>
          )}
        </View>
      </SafeAreaContainer>
    )
  }

  // Show error state if transaction loading failed
  if (loadingError) {
    return (
      <SafeAreaContainer style={transactionStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton onPress={navigateBack} />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ fontSize: 16, textAlign: 'center', color: '#d32f2f', marginBottom: 16 }}>
            ⚠️ Failed to load transaction data
          </ThemedText>
          <ThemedText style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
            {loadingError}
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