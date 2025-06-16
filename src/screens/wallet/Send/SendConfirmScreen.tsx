import React, { useState, useCallback, useEffect } from 'react'
import { View, Alert, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import TransactionSummaryFooter from '@/src/components/features/Send/Confirmation/TransactionSummaryFooter'
import { useSendNavigation } from '@/src/components/ui/Navigation/sendNavigation'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { useWalletStore } from '@/src/store/walletStore'
import { SendTransactionService } from '@/src/services/sendTransactionService'
import { transactionStyles } from '@/src/constants/transactionStyles'
import { useAutoWalletSync } from '@/src/hooks/wallet/useAutoWalletSync'
import { ThemedText } from '@/src/components/ui/Text'
import { useRouter } from 'expo-router'

/**
 * Screen for confirming transaction details before sending
 * Uses the unified transaction store pattern like SendAmountScreen
 */
export default function SendConfirmScreen() {
  const router = useRouter()
  const { navigateBack } = useSendNavigation()
  const [ isValidating, setIsValidating ] = useState(false)
  const [ isLoadingTransaction, setIsLoadingTransaction ] = useState(true)
  const [ loadingError, setLoadingError ] = useState<string | null>(null)
  
  useAutoWalletSync()
  
  // Use only the transaction store like SendAmountScreen does
  const {
    inputs: { recipientAddress, currency, feeRate },
    derived: { amountSats, estimatedFee, totalSats, addressError, amountError, feeError },
    meta: { isLoadingUtxos, isCalculatingFee, error: storeError },
    utxos: { selectedUtxos },
    isValidTransaction,
    getValidationErrors
  } = useSendTransactionStore()
  
  // Get wallet data
  const { wallet, balances } = useWalletStore()
  
  // Load transaction data when screen loads
  useEffect(() => {
    const loadTransactionData = async () => {
      try {
        setIsLoadingTransaction(true)
        setLoadingError(null)
        
        // Load UTXOs and calculate fees using the service
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
  
  // Validation function
  const validateTransaction = useCallback(() => {
    if (!recipientAddress || !amountSats || !wallet) {
      return { isValid: false, error: 'Missing required transaction data' }
    }

    if (addressError) {
      return { isValid: false, error: addressError }
    }

    if (amountError) {
      return { isValid: false, error: amountError }
    }

    if (feeError) {
      return { isValid: false, error: feeError }
    }
      
    if (totalSats > balances.confirmed) {
      return { 
        isValid : false, 
        error   : `Insufficient balance. Need ${totalSats} sats, have ${balances.confirmed} sats`
      }
    }

    if (selectedUtxos.length === 0) {
      return { isValid: false, error: 'No UTXOs selected for transaction' }
    }

    if (!isValidTransaction()) {
      const errors = getValidationErrors()
      return { isValid: false, error: errors.join(', ') }
    }

    return { isValid: true, error: null }
  }, [ recipientAddress, amountSats, wallet, addressError, amountError, feeError, totalSats, balances.confirmed, selectedUtxos.length, isValidTransaction, getValidationErrors ])

  // Handle transaction execution
  const handleSendPress = useCallback(async () => {
    const validation = validateTransaction()
    if (!validation.isValid) {
      Alert.alert(
        'Transaction Error',
        validation.error || 'Unknown validation error',
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
        address     : recipientAddress,
        amount      : amountSats,
        currency,
        feeSats     : estimatedFee,
        feeRate,
        totalAmount : totalSats
      })
      
      // Execute transaction using the service
      const result = await SendTransactionService.executeTransaction()
      
      if (result?.txid) {
        // Transaction successful - navigate to success screen
        router.push('/send/success' as any)
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
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      Alert.alert(
        'Transaction Error',
        errorMessage,
        [ { text: 'OK' } ]
      )
    } finally {
      setIsValidating(false)
    }
  }, [ validateTransaction, isValidating, recipientAddress, amountSats, currency, estimatedFee, feeRate, totalSats, router ])

  // Show loading state while preparing transaction
  if (!wallet || isLoadingTransaction || isLoadingUtxos || isCalculatingFee) {
    return (
      <SafeAreaContainer style={transactionStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton onPress={navigateBack} />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 16 }} />
          <ThemedText style={{ fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
            {!wallet ? 'Loading wallet data...' : 
             isLoadingTransaction ? 'Loading transaction data...' :
             isLoadingUtxos ? 'Loading wallet UTXOs...' :
             isCalculatingFee ? 'Calculating fees...' : 'Preparing transaction...'}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
            Please wait while we prepare your transaction
          </ThemedText>
        </View>
      </SafeAreaContainer>
    )
  }

  // Show error state if transaction loading failed
  if (loadingError || storeError) {
    const displayError = loadingError || storeError
    return (
      <SafeAreaContainer style={transactionStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton onPress={navigateBack} />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ fontSize: 16, textAlign: 'center', color: '#d32f2f', marginBottom: 16 }}>
            ⚠️ Failed to load transaction data
          </ThemedText>
          <ThemedText style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
            {displayError}
          </ThemedText>
        </View>
      </SafeAreaContainer>
    )
  }

  const validation = validateTransaction()

  return (
    <SafeAreaContainer style={transactionStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <BackButton onPress={navigateBack} />
      
      {!validation.isValid && (
        <View style={{ 
          margin          : 20, 
          padding         : 15, 
          backgroundColor : '#ffebee', 
          borderRadius    : 8,
          borderWidth     : 1,
          borderColor     : '#f44336'
        }}>
          <ThemedText style={{ color: '#d32f2f', fontSize: 14, textAlign: 'center' }}>
            ⚠️ {validation.error}
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
        amount={amountSats}
        address={recipientAddress}
        feeSats={estimatedFee}
        feeRate={feeRate}
        currency={currency}
        totalAmount={totalSats}
        onSendPress={handleSendPress}
      />
    </SafeAreaContainer>
  )
} 