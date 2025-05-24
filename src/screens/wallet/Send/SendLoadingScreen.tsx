import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import EnhancedLoadingState from '@/src/components/ui/Feedback/EnhancedLoadingState'
import { useTransactionExecution } from '@/src/hooks/send/useTransactionExecution'
import { ThemedText } from '@/src/components/ui/Text'

interface TransactionState {
  stage: string
  progress: number
  hasCompleted: boolean
}

/**
 * Screen that shows while a transaction is processing
 * Now uses the clean transaction store and service
 */
export default function SendLoadingScreen() {
  const router = useRouter()
  const [ state, setState ] = useState<TransactionState>({
    stage        : 'initializing',
    progress     : 0,
    hasCompleted : false
  })
  
  const {
    executeTransaction,
    isExecuting,
    error: executionError,
    result,
    isValid,
    getValidationErrors
  } = useTransactionExecution()

  useEffect(() => {
    let isMounted = true
    
    const processTransaction = async () => {
      try {
        // Validate transaction before starting
        if (!isValid()) {
          const errors = getValidationErrors()
          throw new Error(`Transaction validation failed: ${errors.join(', ')}`)
        }

        if (!isMounted) return
        setState(prev => ({ ...prev, stage: 'validating_inputs', progress: 20 }))

        if (!isMounted) return
        setState(prev => ({ ...prev, stage: 'building_transaction', progress: 40 }))

        if (!isMounted) return
        setState(prev => ({ ...prev, stage: 'signing_transaction', progress: 60 }))

        if (!isMounted) return
        setState(prev => ({ ...prev, stage: 'broadcasting', progress: 80 }))
        
        // Execute the transaction using the new service
        const transactionResult = await executeTransaction()
        
        if (!transactionResult) {
          throw new Error('Transaction execution failed')
        }
        
        console.log('✅ Transaction completed successfully:', transactionResult)

        if (!isMounted) return
        setState(prev => ({ ...prev, stage: 'completed', progress: 100, hasCompleted: true }))

        // Navigate to success screen after a brief delay
        setTimeout(() => {
          if (isMounted) {
            console.log('Navigating to wallet screen')
            router.replace('/(tabs)/wallet')
          }
        }, 2000)

      } catch (transactionError) {
        console.error('Transaction execution error:', transactionError)
        
        if (!isMounted) return
        
        setState(prev => ({ 
          ...prev, 
          stage        : 'Transaction failed',
          progress     : 0,
          hasCompleted : true
        }))

        // Navigate back to confirm screen after showing error
        setTimeout(() => {
          if (isMounted) {
            router.replace('/wallet/send/confirm')
          }
        }, 3000)
      }
    }

    processTransaction()
    
    return () => {
      isMounted = false
    }
  }, [ executeTransaction, isValid, getValidationErrors, router ])

  return (
    <StatusScreenLayout>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        {executionError ? (
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 18, color: '#ff4444', marginBottom: 10, textAlign: 'center' }}>
              ❌ {state.stage}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
              {executionError}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              Returning to previous screen...
            </ThemedText>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <EnhancedLoadingState
              currentStage={state.stage}
              progress={state.progress}
              message={
                state.hasCompleted 
                  ? result 
                    ? `Your Bitcoin has been sent! TXID: ${result.txid.slice(0, 8)}...`
                    : 'Your Bitcoin has been sent!'
                  : isExecuting 
                    ? 'Processing your transaction...'
                    : 'Please wait while we process your transaction...'
              }
              subText={
                state.hasCompleted 
                  ? result 
                    ? `Fee: ${result.fee} sats | Amount: ${result.amount} sats`
                    : ''
                  : 'This may take a few moments'
              }
            />
          </View>
        )}
      </View>
    </StatusScreenLayout>
  )
} 