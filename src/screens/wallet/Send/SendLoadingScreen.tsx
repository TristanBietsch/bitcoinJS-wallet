import React, { useEffect, useState, useCallback } from 'react'
import { View } from 'react-native'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import { ThemedText } from '@/src/components/ui/Text'
import { useTransaction } from '@/src/hooks/send/useTransaction'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { useWalletStore } from '@/src/store/walletStore'
import { SendTransactionService } from '@/src/services/sendTransactionService'
import { validateTransactionForExecution } from '@/src/utils/bitcoin/transactionValidation'
import { TransactionMonitor } from '@/src/utils/bitcoin/transactionMonitor'
import type { TransactionValidationResult } from '@/src/utils/bitcoin/transactionValidation'

type ProcessingPhase = 
  | 'initializing'
  | 'validating' 
  | 'loading_utxos'
  | 'building'
  | 'signing'
  | 'broadcasting'
  | 'monitoring'
  | 'complete'
  | 'error'

interface ProcessingState {
  phase           : ProcessingPhase
  progress        : number
  message         : string
  details?        : string
  validationResult? : TransactionValidationResult
  txid?           : string
}

/**
 * Enhanced screen that shows detailed progress while a transaction is processing
 * Provides real-time feedback for each phase of the transaction lifecycle
 */
export default function SendLoadingScreen() {
  const { state, actions } = useTransaction()
  const sendStore = useSendTransactionStore()
  const walletStore = useWalletStore()
  
  const [ processingState, setProcessingState ] = useState<ProcessingState>({
    phase    : 'initializing',
    progress : 0,
    message  : 'Initializing transaction...',
  })

  const [ transactionMonitor, setTransactionMonitor ] = useState<TransactionMonitor | null>(null)

  // Update processing state based on current phase
  const updateProcessingState = useCallback((updates: Partial<ProcessingState>) => {
    setProcessingState(prev => ({ ...prev, ...updates }))
  }, [])

  // Enhanced transaction execution with detailed progress tracking
  const executeTransactionWithProgress = useCallback(async () => {
    try {
      // Phase 1: Validation
      updateProcessingState({
        phase    : 'validating',
        progress : 10,
        message  : 'Validating transaction parameters...',
        details  : 'Checking addresses, amounts, and fees'
      })

      // Perform comprehensive validation
      const inputs = sendStore.utxos.selectedUtxos
      const outputs = [ { 
        address : sendStore.inputs.recipientAddress, 
        value   : sendStore.derived.amountSats 
      } ]
      
      const validationResult = await validateTransactionForExecution(
        inputs,
        outputs,
        sendStore.inputs.feeRate,
        sendStore.derived.estimatedFee,
        sendStore.derived.estimatedSize,
        {
          wallet           : walletStore.wallet!,
          availableBalance : walletStore.balances.confirmed
        }
      )

      if (!validationResult.isValid) {
        updateProcessingState({
          phase    : 'error',
          progress : 0,
          message  : 'Transaction validation failed',
          details  : validationResult.errors[0]?.userMessage || 'Unknown validation error'
        })
        actions.navigateToError(validationResult.errors[0])
        return
      }

      updateProcessingState({
        validationResult,
        progress : 20,
        message  : 'Validation complete',
        details  : validationResult.warnings.length > 0 
          ? `${validationResult.warnings.length} warning(s) noted`
          : 'All checks passed'
      })

      // Phase 2: Load UTXOs if needed
      if (sendStore.utxos.selectedUtxos.length === 0) {
        updateProcessingState({
          phase    : 'loading_utxos',
          progress : 30,
          message  : 'Loading wallet UTXOs...',
          details  : 'Fetching confirmed transactions'
        })

        await SendTransactionService.loadUtxosAndCalculateFees()

        updateProcessingState({
          progress : 40,
          message  : 'UTXOs loaded successfully',
          details  : `Selected ${sendStore.utxos.selectedUtxos.length} UTXOs`
        })
      }

      // Phase 3: Build transaction
      updateProcessingState({
        phase    : 'building',
        progress : 50,
        message  : 'Building transaction...',
        details  : 'Creating PSBT with inputs and outputs'
      })

      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UX

      // Phase 4: Sign transaction
      updateProcessingState({
        phase    : 'signing',
        progress : 70,
        message  : 'Signing transaction...',
        details  : 'Applying cryptographic signatures'
      })

      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UX

      // Phase 5: Broadcast transaction
      updateProcessingState({
        phase    : 'broadcasting',
        progress : 85,
        message  : 'Broadcasting to network...',
        details  : 'Submitting to Bitcoin mempool'
      })

      // Execute the actual transaction
      const result = await actions.executeTransaction()

      if (!result) {
        updateProcessingState({
          phase    : 'error',
          progress : 0,
          message  : 'Transaction failed',
          details  : state.error?.userMessage || 'Unknown error occurred'
        })
        
        if (state.error) {
          actions.navigateToError(state.error)
        }
        return
      }

      // Phase 6: Monitor transaction
      updateProcessingState({
        phase    : 'monitoring',
        progress : 95,
        message  : 'Transaction submitted successfully!',
        details  : `Transaction ID: ${result.txid.slice(0, 8)}...`,
        txid     : result.txid
      })

      // Start monitoring the transaction
      const monitor = new TransactionMonitor(result.txid, {
        onStatusUpdate : (status) => {
          if (status.isConfirmed) {
            updateProcessingState({
              phase    : 'complete',
              progress : 100,
              message  : 'Transaction confirmed!',
              details  : 'Successfully added to blockchain'
            })
          }
        },
        onConfirmed : () => {
          // Transaction is confirmed, we can navigate
          setTimeout(() => {
            actions.navigateToSuccess(result.txid)
          }, 1500) // Show success state briefly
        },
        onFailed : (error) => {
          console.warn('Transaction monitoring failed:', error)
          // Even if monitoring fails, the transaction was broadcast successfully
          // So we still navigate to success
          setTimeout(() => {
            actions.navigateToSuccess(result.txid)
          }, 2000)
        }
      })

      setTransactionMonitor(monitor)
      monitor.start()

      // Navigate to success after a brief delay to show the success state
      setTimeout(() => {
        actions.navigateToSuccess(result.txid)
      }, 2000)

    } catch (error) {
      console.error('Transaction execution failed:', error)
      updateProcessingState({
        phase    : 'error',
        progress : 0,
        message  : 'Transaction failed',
        details  : error instanceof Error ? error.message : 'Unknown error occurred'
      })

      const mappedError = state.error || {
        code        : 'UNKNOWN_ERROR',
        message     : 'Transaction execution failed',
        userMessage : 'An unexpected error occurred while processing your transaction.',
        severity    : 'error' as const,
        recoverable : true,
        retryable   : true,
        timestamp   : Date.now()
      }

      actions.navigateToError(mappedError)
    }
  }, [ sendStore, walletStore, actions, state.error, updateProcessingState ])

  // Start transaction processing when component mounts
  useEffect(() => {
    executeTransactionWithProgress()

    // Cleanup transaction monitor on unmount
    return () => {
      if (transactionMonitor) {
        transactionMonitor.stop()
      }
    }
  }, []) // Empty dependency array - only run once on mount

  // Get progress bar color based on phase
  const getProgressColor = () => {
    switch (processingState.phase) {
      case 'error': return '#ef4444'
      case 'complete': return '#10b981'
      default: return '#3b82f6'
    }
  }

  // Get icon type based on phase
  const getIconType = () => {
    switch (processingState.phase) {
      case 'error': return 'error'
      case 'complete': return 'success'
      default: return 'loading'
    }
  }

  return (
    <StatusScreenLayout>
      <StatusIcon type={getIconType()} />
      
      <MessageDisplay
        title="Sending Bitcoin"
        subtitle={processingState.message}
      />

      {/* Progress indicator */}
      <View style={{ 
        width      : '80%', 
        marginTop  : 20,
        alignItems : 'center' 
      }}>
        {/* Progress bar */}
        <View style={{
          width           : '100%',
          height          : 4,
          backgroundColor : '#e5e5e5',
          borderRadius    : 2,
          overflow        : 'hidden',
          marginBottom    : 12
        }}>
          <View style={{
            width           : `${processingState.progress}%`,
            height          : '100%',
            backgroundColor : getProgressColor(),
            transition      : 'width 0.3s ease'
          }} />
        </View>

        {/* Progress percentage */}
        <ThemedText style={{ 
          fontSize     : 14, 
          opacity      : 0.7,
          marginBottom : 8 
        }}>
          {processingState.progress}% Complete
        </ThemedText>

        {/* Phase details */}
        {processingState.details && (
          <ThemedText style={{ 
            fontSize   : 12, 
            opacity    : 0.6,
            textAlign  : 'center',
            lineHeight : 16
          }}>
            {processingState.details}
          </ThemedText>
        )}

        {/* Validation warnings */}
        {processingState.validationResult?.warnings.length > 0 && (
          <View style={{ 
            marginTop       : 16,
            padding         : 12,
            backgroundColor : '#fef3c7',
            borderRadius    : 8,
            width           : '100%'
          }}>
            <ThemedText style={{ 
              fontSize  : 12, 
              color     : '#92400e',
              textAlign : 'center' 
            }}>
              ⚠️ {processingState.validationResult.warnings[0]}
            </ThemedText>
          </View>
        )}

        {/* Transaction ID (when available) */}
        {processingState.txid && (
          <View style={{ 
            marginTop       : 16,
            padding         : 12,
            backgroundColor : '#f0f9ff',
            borderRadius    : 8,
            width           : '100%'
          }}>
            <ThemedText style={{ 
              fontSize   : 10, 
              color      : '#1e40af',
              textAlign  : 'center',
              fontFamily : 'monospace'
            }}>
              {processingState.txid}
            </ThemedText>
          </View>
        )}

        {/* Estimated confirmation time */}
        {processingState.validationResult?.estimatedTime && processingState.phase === 'monitoring' && (
          <View style={{ marginTop: 12 }}>
            <ThemedText style={{ 
              fontSize  : 12, 
              opacity   : 0.6,
              textAlign : 'center'
            }}>
              Estimated confirmation: {processingState.validationResult.estimatedTime}
            </ThemedText>
          </View>
        )}
      </View>
    </StatusScreenLayout>
  )
} 