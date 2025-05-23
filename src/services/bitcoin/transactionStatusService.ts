/**
 * Transaction Status Tracking Service
 * Provides real-time progress updates and status monitoring for Bitcoin transactions
 */

import { EventEmitter } from 'events'

export type TransactionStage = 
  | 'initializing'
  | 'validating_inputs'
  | 'fetching_utxos'
  | 'selecting_utxos'
  | 'estimating_fees'
  | 'building_transaction'
  | 'signing_transaction'
  | 'broadcasting'
  | 'confirming'
  | 'completed'
  | 'failed'

export interface TransactionProgress {
  stage: TransactionStage
  progress: number // 0-100
  message: string
  details?: Record<string, any>
  timestamp: number
}

export interface TransactionStatus {
  txid?: string
  stage: TransactionStage
  progress: number
  isComplete: boolean
  isError: boolean
  error?: Error
  startTime: number
  endTime?: number
  progressHistory: TransactionProgress[]
  currentMessage: string
}

class TransactionStatusTracker extends EventEmitter {
  private currentStatus: TransactionStatus | null = null
  private readonly stageProgressMap: Record<TransactionStage, number> = {
    initializing        : 5,
    validating_inputs   : 10,
    fetching_utxos      : 20,
    selecting_utxos     : 30,
    estimating_fees     : 40,
    building_transaction: 60,
    signing_transaction : 80,
    broadcasting        : 90,
    confirming          : 95,
    completed           : 100,
    failed              : 0
  }

  private readonly stageMessages: Record<TransactionStage, string> = {
    initializing        : 'Initializing transaction...',
    validating_inputs   : 'Validating transaction details...',
    fetching_utxos      : 'Fetching available funds...',
    selecting_utxos     : 'Selecting optimal inputs...',
    estimating_fees     : 'Calculating network fees...',
    building_transaction: 'Building transaction...',
    signing_transaction : 'Signing transaction...',
    broadcasting        : 'Broadcasting to network...',
    confirming          : 'Waiting for confirmation...',
    completed           : 'Transaction completed successfully!',
    failed              : 'Transaction failed'
  }

  startTransaction(): string {
    const transactionId = this.generateTransactionId()
    
    this.currentStatus = {
      stage           : 'initializing',
      progress        : 0,
      isComplete      : false,
      isError         : false,
      startTime       : Date.now(),
      progressHistory : [],
      currentMessage  : this.stageMessages.initializing
    }

    this.updateProgress('initializing')
    return transactionId
  }

  updateProgress(
    stage: TransactionStage, 
    details?: Record<string, any>,
    customMessage?: string
  ): void {
    if (!this.currentStatus) return

    const progress = this.stageProgressMap[stage]
    const message = customMessage || this.stageMessages[stage]
    
    const progressUpdate: TransactionProgress = {
      stage,
      progress,
      message,
      details,
      timestamp : Date.now()
    }

    this.currentStatus.stage = stage
    this.currentStatus.progress = progress
    this.currentStatus.currentMessage = message
    this.currentStatus.progressHistory.push(progressUpdate)

    // Check for completion states
    if (stage === 'completed') {
      this.currentStatus.isComplete = true
      this.currentStatus.endTime = Date.now()
    } else if (stage === 'failed') {
      this.currentStatus.isError = true
      this.currentStatus.endTime = Date.now()
    }

    // Emit progress event
    this.emit('progress', { ...this.currentStatus })
    
    // Emit stage-specific events
    this.emit(`stage:${stage}`, progressUpdate)

    console.log(`Transaction Progress: ${stage} (${progress}%) - ${message}`)
  }

  setTransactionId(txid: string): void {
    if (this.currentStatus) {
      this.currentStatus.txid = txid
      this.emit('txid', txid)
    }
  }

  setError(error: Error, stage?: TransactionStage): void {
    if (!this.currentStatus) return

    this.currentStatus.isError = true
    this.currentStatus.error = error
    this.currentStatus.endTime = Date.now()
    
    if (stage) {
      this.updateProgress(stage, { error: error.message }, `Failed: ${error.message}`)
    } else {
      this.updateProgress('failed', { error: error.message })
    }

    this.emit('error', error)
  }

  getStatus(): TransactionStatus | null {
    return this.currentStatus ? { ...this.currentStatus } : null
  }

  getDuration(): number {
    if (!this.currentStatus) return 0
    
    const endTime = this.currentStatus.endTime || Date.now()
    return endTime - this.currentStatus.startTime
  }

  reset(): void {
    this.currentStatus = null
    this.removeAllListeners()
  }

  // Progress estimation helpers
  addSubProgress(baseProgress: number, subProgress: number, maxSubSteps: number): number {
    const nextStageProgress = this.getNextStageProgress(this.currentStatus?.stage || 'initializing')
    const progressRange = nextStageProgress - baseProgress
    const subStepProgress = (progressRange / maxSubSteps) * subProgress
    
    return Math.min(baseProgress + subStepProgress, nextStageProgress - 1)
  }

  private getNextStageProgress(currentStage: TransactionStage): number {
    const stages = Object.keys(this.stageProgressMap) as TransactionStage[]
    const currentIndex = stages.indexOf(currentStage)
    
    if (currentIndex >= 0 && currentIndex < stages.length - 1) {
      return this.stageProgressMap[stages[currentIndex + 1]]
    }
    
    return 100
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Utility methods for common progress patterns
  updateUtxoFetchProgress(addressIndex: number, totalAddresses: number): void {
    const baseProgress = this.stageProgressMap.fetching_utxos
    const subProgress = this.addSubProgress(baseProgress, addressIndex + 1, totalAddresses)
    
    this.updateProgress('fetching_utxos', 
      { addressIndex, totalAddresses },
      `Fetching UTXOs from address ${addressIndex + 1} of ${totalAddresses}...`
    )
  }

  updateUtxoSelectionProgress(selectedCount: number, requiredInputs: number): void {
    const baseProgress = this.stageProgressMap.selecting_utxos
    const subProgress = this.addSubProgress(baseProgress, selectedCount, requiredInputs)
    
    this.updateProgress('selecting_utxos',
      { selectedCount, requiredInputs },
      `Selected ${selectedCount} of ~${requiredInputs} required inputs...`
    )
  }

  updateSigningProgress(signedInputs: number, totalInputs: number): void {
    const baseProgress = this.stageProgressMap.signing_transaction
    const subProgress = this.addSubProgress(baseProgress, signedInputs, totalInputs)
    
    this.updateProgress('signing_transaction',
      { signedInputs, totalInputs },
      `Signing input ${signedInputs} of ${totalInputs}...`
    )
  }
}

// Singleton instance for global transaction tracking
export const transactionStatusTracker = new TransactionStatusTracker()

// Hook for monitoring transaction status
export function useTransactionStatus() {
  return {
    tracker         : transactionStatusTracker,
    startTransaction: () => transactionStatusTracker.startTransaction(),
    updateProgress  : (stage: TransactionStage, details?: Record<string, any>, message?: string) => 
      transactionStatusTracker.updateProgress(stage, details, message),
    setError        : (error: Error, stage?: TransactionStage) => 
      transactionStatusTracker.setError(error, stage),
    getStatus       : () => transactionStatusTracker.getStatus(),
    getDuration     : () => transactionStatusTracker.getDuration(),
    reset           : () => transactionStatusTracker.reset()
  }
}

// Convenience functions for transaction lifecycle
export function startTransactionTracking(): string {
  return transactionStatusTracker.startTransaction()
}

export function trackProgress(stage: TransactionStage, details?: Record<string, any>, message?: string): void {
  transactionStatusTracker.updateProgress(stage, details, message)
}

export function trackError(error: Error, stage?: TransactionStage): void {
  transactionStatusTracker.setError(error, stage)
}

export function trackTxid(txid: string): void {
  transactionStatusTracker.setTransactionId(txid)
}

export function getTransactionStatus(): TransactionStatus | null {
  return transactionStatusTracker.getStatus()
}

export function resetTransactionTracking(): void {
  transactionStatusTracker.reset()
} 