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
  
  const [ state, setState ] = useState<TransactionState>({
    stage        : 'Initializing transaction...',
    progress     : 0,
    hasStarted   : false,
    hasCompleted : false
  })
  
  const navigationRef = useRef<{ hasNavigated: boolean }>({ hasNavigated: false })
  const executionRef = useRef<{ hasExecuted: boolean }>({ hasExecuted: false })
  const transactionParams = useRef<any>(null)
  
  useEffect(() => {
    if (executionRef.current.hasExecuted || navigationRef.current.hasNavigated) {
      return
    }
    
    const executeTransaction = async () => {
      try {
        executionRef.current.hasExecuted = true
        setState(prev => ({ ...prev, hasStarted: true, stage: 'Starting transaction...', progress: 10 }))
        
        // Get data from stores directly to avoid reactive updates
        const sendState = useSendStore.getState()
        const walletState = useWalletStore.getState()
        
        const { address, amount, errorMode } = sendState
        const { wallet } = walletState
        
        if (errorMode === 'validation') {
          setState(prev => ({ ...prev, stage: 'Validation failed', progress: 0 }))
          await new Promise(resolve => setTimeout(resolve, 1500))
          if (!navigationRef.current.hasNavigated) {
            navigationRef.current.hasNavigated = true
            router.replace('/send/error' as any)
          }
          return
        }
        
        if (errorMode === 'network') {
          setState(prev => ({ ...prev, stage: 'Network error occurred', progress: 50 }))
          await new Promise(resolve => setTimeout(resolve, 1500))
          if (!navigationRef.current.hasNavigated) {
            navigationRef.current.hasNavigated = true
            router.replace('/send/error' as any)
          }
          return
        }
        
        if (!address || !amount || !wallet) {
          throw new Error('Missing required transaction data')
        }
        
        setState(prev => ({ ...prev, stage: 'Validating transaction...', progress: 20 }))
        await new Promise(resolve => setTimeout(resolve, 300))
        
        if (!transactionParams.current) {
          transactionParams.current = convertUIToBitcoinParams()
          validateTransactionParams(transactionParams.current)
        }
        
        setState(prev => ({ ...prev, stage: 'Processing transaction...', progress: 40 }))
        
        console.log('Executing transaction with params:', transactionParams.current)
        
        const txid = await sendBitcoinAsync({
          recipientAddress : transactionParams.current.recipientAddress,
          amountSat        : transactionParams.current.amountSat,
          feeRate          : transactionParams.current.feeRate,
          changeAddress    : transactionParams.current.changeAddress
        })
        
        setState(prev => ({ ...prev, stage: 'Transaction sent successfully!', progress: 100, hasCompleted: true }))
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (!navigationRef.current.hasNavigated) {
          navigationRef.current.hasNavigated = true
          
          // Reset store before navigation
          useSendStore.getState().reset()
          
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
    
    const timer = setTimeout(executeTransaction, 500)
    
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (error && !navigationRef.current.hasNavigated && !state.hasCompleted && !isLoading) {
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
  }, [ error, state.hasCompleted, isLoading, router ])
  
  useEffect(() => {
    return () => {
      if (isLoading && !state.hasCompleted) {
        reset()
      }
    }
  }, [ isLoading, state.hasCompleted, reset ])

  if (error && !isLoading && !executionRef.current.hasExecuted) {
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