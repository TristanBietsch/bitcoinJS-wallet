import React, { useEffect } from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import EnhancedLoadingState from '@/src/components/ui/Feedback/EnhancedLoadingState'
import { useEnhancedTransactionProcessing } from '@/src/hooks/send/useEnhancedTransactionProcessing'
import { useSendStore } from '@/src/store/sendStore'
import { convertUIToBitcoinParams } from '@/src/utils/send/transactionParams'

/**
 * Screen that shows while a transaction is processing
 * Uses enhanced transaction processing with comprehensive error handling and progress tracking
 */
export default function SendLoadingScreen() {
  const { processTransaction, result, cancel } = useEnhancedTransactionProcessing()
  const { address, amount, selectedFeeOption, feeRates } = useSendStore()
  
  // Start processing when component mounts
  useEffect(() => {
    const startTransaction = async () => {
      try {
        // Convert UI parameters to Bitcoin transaction parameters
        const transactionParams = convertUIToBitcoinParams()
        
        // Use the enhanced transaction processing
        await processTransaction({
          recipientAddress : transactionParams.recipientAddress,
          amountSat        : transactionParams.amountSat,
          feeRate          : transactionParams.feeRate,
          changeAddress    : transactionParams.changeAddress
        })
      } catch (error) {
        console.error('Transaction processing failed:', error)
        // Error navigation is handled by the enhanced hook
      }
    }
    
    // Only start if we have required parameters
    if (address && amount && (selectedFeeOption || feeRates)) {
      startTransaction()
    }
  }, [ processTransaction, address, amount, selectedFeeOption, feeRates ])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't cancel if transaction completed successfully
      if (!result.transactionId && result.isLoading) {
        cancel()
      }
    }
  }, [ cancel, result.transactionId, result.isLoading ])
  
  return (
    <StatusScreenLayout>
      <EnhancedLoadingState
        progress={result.progress}
        currentStage={result.currentStage}
        message={result.currentStage || 'Processing transaction...'}
        subText={result.progress > 0 ? `${result.progress}% complete` : 'This may take a few moments'}
        showProgressBar={true}
        showStageIndicator={true}
      />
    </StatusScreenLayout>
  )
} 