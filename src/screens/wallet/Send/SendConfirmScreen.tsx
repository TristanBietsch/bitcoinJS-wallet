import React, { useState, useCallback, useMemo } from 'react'
import { View, Alert } from 'react-native'
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
  const { navigateBack, navigateToSendLoading } = useSendNavigation()
  const [ isValidating, setIsValidating ] = useState(false)
  
  useAutoWalletSync()
  
  // Get transaction data from stores
  const transactionStore = useSendTransactionStore()
  const { validation } = useTransaction()
  
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
  }, [ address, amount, currency, totalAmount, feeSats, feeRate, validation ])

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