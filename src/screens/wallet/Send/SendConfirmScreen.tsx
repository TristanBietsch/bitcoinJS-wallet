import React, { useEffect, useState } from 'react'
import { View, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import TransactionSummaryFooter from '@/src/components/features/Send/Confirmation/TransactionSummaryFooter'
import { useSendNavigation } from '@/src/components/ui/Navigation/sendNavigation'
import { useTransactionParams } from '@/src/hooks/send/useTransactionParams'
import { transactionStyles } from '@/src/constants/transactionStyles'
import { useSendStore } from '@/src/store/sendStore'
import { useWalletStore } from '@/src/store/walletStore'
import { useAutoWalletSync } from '@/src/hooks/wallet/useAutoWalletSync'
import { ThemedText } from '@/src/components/ui/Text'
import { convertUIToBitcoinParams, validateTransactionParams } from '@/src/utils/send/transactionParams'
import { isValidBitcoinAddress } from '@/src/utils/validation/validateAddress'

/**
 * Screen for confirming transaction details before sending
 */
export default function SendConfirmScreen() {
  const { navigateBack, navigateToSendLoading } = useSendNavigation()
  const { setErrorMode } = useSendStore()
  const { wallet, balances } = useWalletStore()
  const [ validationError, setValidationError ] = useState<string | null>(null)
  const [ isValidating, setIsValidating ] = useState(false)
  
  // Enable auto-sync to ensure wallet is up-to-date
  useAutoWalletSync()
  
  const { 
    amount, 
    address, 
    feeSats,
    feeRate,
    currency, 
    totalAmount,
  } = useTransactionParams()
  
  // Reset error mode when mounting this screen
  useEffect(() => {
    setErrorMode('none')
    setValidationError(null)
  }, [ setErrorMode ])

  // Validate transaction parameters when they change
  useEffect(() => {
    const validateTransaction = async () => {
      setIsValidating(true)
      setValidationError(null)
      
      try {
        // Basic validation
        if (!address) {
          throw new Error('Recipient address is required')
        }
        
        if (!isValidBitcoinAddress(address)) {
          throw new Error('Invalid recipient address format')
        }
        
        if (!wallet) {
          throw new Error('Wallet not loaded')
        }
        
        if (amount <= 0) {
          throw new Error('Amount must be greater than 0')
        }
        
        if (feeSats <= 0) {
          throw new Error('Invalid fee calculation')
        }
        
        // Check if user has sufficient balance
        const totalNeededSats = currency === 'SATS' 
          ? Math.floor(totalAmount)
          : Math.floor(totalAmount * 100_000_000) // Convert BTC to sats
          
        if (totalNeededSats > balances.confirmed) {
          throw new Error(`Insufficient balance. Need ${totalNeededSats} sats, have ${balances.confirmed} sats`)
        }
        
        // Test parameter conversion
        const bitcoinParams = convertUIToBitcoinParams()
        validateTransactionParams(bitcoinParams)
        
        console.log('Transaction validation passed:', {
          address,
          amount,
          currency,
          feeSats,
          feeRate,
          totalAmount,
          availableBalance : balances.confirmed,
          bitcoinParams
        })
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
        setValidationError(errorMessage)
        console.error('Transaction validation failed:', errorMessage)
      } finally {
        setIsValidating(false)
      }
    }
    
    // Only validate if we have the required data
    if (address && amount && wallet) {
      validateTransaction()
    }
  }, [ address, amount, currency, feeSats, feeRate, totalAmount, wallet, balances.confirmed ])

  const handleSendPress = async () => {
    // Final validation before proceeding
    if (validationError) {
      Alert.alert(
        'Transaction Error',
        validationError,
        [ { text: 'OK' } ]
      )
      return
    }
    
    if (isValidating) {
      Alert.alert(
        'Please Wait',
        'Transaction is being validated. Please wait a moment.',
        [ { text: 'OK' } ]
      )
      return
    }
    
    // Proceed to loading screen
    navigateToSendLoading()
  }

  // Show loading state while wallet is loading
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
      
      {/* Back Button */}
      <BackButton onPress={navigateBack} />
      
      {/* Validation Error Display */}
      {validationError && (
        <View style={{ 
          margin          : 20, 
          padding         : 15, 
          backgroundColor : '#ffebee', 
          borderRadius    : 8,
          borderWidth     : 1,
          borderColor     : '#f44336'
        }}>
          <ThemedText style={{ color: '#d32f2f', fontSize: 14, textAlign: 'center' }}>
            ⚠️ {validationError}
          </ThemedText>
        </View>
      )}
      
      {/* Validation Status */}
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
            🔄 Validating transaction...
          </ThemedText>
        </View>
      )}
      

      
      {/* Transaction Summary with Send Button */}
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