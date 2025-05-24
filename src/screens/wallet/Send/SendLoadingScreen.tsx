import React, { useEffect, useState, useRef } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import EnhancedLoadingState from '@/src/components/ui/Feedback/EnhancedLoadingState'
import { useSendBitcoin } from '@/src/hooks/bitcoin/useSendBitcoin'
import { useSendStore } from '@/src/store/sendStore'
import { useWalletStore } from '@/src/store/walletStore'
import { convertUIToBitcoinParams, validateTransactionParams } from '@/src/utils/send/transactionParams'
import { ThemedText } from '@/src/components/ui/Text'

interface TransactionState {
  stage: string
  progress: number
  hasStarted: boolean
  hasCompleted: boolean
}

/**
 * Screen that shows while a transaction is processing
 * Simplified to prevent infinite loops
 */
export default function SendLoadingScreen() {
  const router = useRouter()
  const { sendBitcoinAsync, isLoading, error, reset } = useSendBitcoin()
  const { address, amount, errorMode, reset: resetSendStore } = useSendStore()
  const { wallet } = useWalletStore()
  
  // Consolidate all state into a single object to prevent cascading updates
  const [ state, setState ] = useState<TransactionState>({
    stage        : 'Initializing transaction...',
    progress     : 0,
    hasStarted   : false,
    hasCompleted : false
  })
  
  // Use ref to prevent effect dependencies from causing loops
  const navigationRef = useRef<{ hasNavigated: boolean }>({ hasNavigated: false })
  
  // Single effect to handle the entire transaction flow
  useEffect(() => {
    // Prevent multiple executions or navigation loops
    if (state.hasStarted || navigationRef.current.hasNavigated) {
      return
    }
    
    const executeTransaction = async () => {
      try {
        // Mark as started to prevent re-execution
        setState(prev => ({ ...prev, hasStarted: true, stage: 'Starting transaction...', progress: 10 }))
        
        // Handle test error modes
        if (errorMode === 'validation') {
          setState(prev => ({ ...prev, stage: 'Validation failed', progress: 0 }))
          await new Promise(resolve => setTimeout(resolve, 1500))
          navigationRef.current.hasNavigated = true
          router.replace('/send/error' as any)
          return
        }
        
        if (errorMode === 'network') {
          setState(prev => ({ ...prev, stage: 'Network error occurred', progress: 50 }))
          await new Promise(resolve => setTimeout(resolve, 1500))
          navigationRef.current.hasNavigated = true
          router.replace('/send/error' as any)
          return
        }
        
        // Validate required data
        if (!address || !amount || !wallet) {
          throw new Error('Missing required transaction data')
        }
        
        // Phase 1: Validation
        setState(prev => ({ ...prev, stage: 'Validating transaction...', progress: 20 }))
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const transactionParams = convertUIToBitcoinParams()
        validateTransactionParams(transactionParams)
        
        // Phase 2: Processing
        setState(prev => ({ ...prev, stage: 'Processing transaction...', progress: 40 }))
        
        // Execute the transaction
        const txid = await sendBitcoinAsync({
          recipientAddress : transactionParams.recipientAddress,
          amountSat        : transactionParams.amountSat,
          feeRate          : transactionParams.feeRate,
          changeAddress    : transactionParams.changeAddress
        })
        
        // Success
        setState(prev => ({ ...prev, stage: 'Transaction sent successfully!', progress: 100, hasCompleted: true }))
        
        // Wait then navigate
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!navigationRef.current.hasNavigated) {
          navigationRef.current.hasNavigated = true
          resetSendStore()
          router.replace({
            pathname : '/send/success',
            params   : { transactionId: txid }
          } as any)
        }
        
      } catch (transactionError) {
        console.error('Transaction failed:', transactionError)
        
        setState(prev => ({ ...prev, stage: 'Transaction failed', progress: 0 }))
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!navigationRef.current.hasNavigated) {
          navigationRef.current.hasNavigated = true
          router.replace('/send/error' as any)
        }
      }
    }
    
    // Start transaction after a small delay
    const timer = setTimeout(executeTransaction, 500)
    
    return () => {
      clearTimeout(timer)
    }
  }, []) // Empty dependency array to run only once
  
  // Separate effect for handling external errors (from useSendBitcoin hook)
  useEffect(() => {
    if (error && !navigationRef.current.hasNavigated && !state.hasCompleted) {
      console.error('External error:', error.message)
      
      setState(prev => ({ ...prev, stage: 'Transaction failed', progress: 0 }))
      
      const timer = setTimeout(() => {
        if (!navigationRef.current.hasNavigated) {
          navigationRef.current.hasNavigated = true
          router.replace('/send/error' as any)
        }
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [ error, state.hasCompleted, router ])
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      // Reset the mutation if component unmounts during processing
      if (isLoading && !state.hasCompleted) {
        reset()
      }
    }
  }, [ isLoading, state.hasCompleted, reset ])

  // Show error state if there's an immediate error
  if (error && !isLoading && !state.hasStarted) {
    return (
      <StatusScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 10, color: '#d32f2f' }}>
            Transaction Failed
          </ThemedText>
          <ThemedText style={{ fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 20 }}>
            {error.message}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, textAlign: 'center', color: '#999' }}>
            Redirecting to error screen...
          </ThemedText>
        </View>
      </StatusScreenLayout>
    )
  }

  return (
    <StatusScreenLayout>
      <EnhancedLoadingState
        progress={state.progress}
        currentStage={state.stage}
        message={state.stage}
        subText={state.progress > 0 ? `${state.progress}% complete` : 'This may take a few moments'}
        showProgressBar={true}
        showStageIndicator={true}
      />
    </StatusScreenLayout>
  )
} 