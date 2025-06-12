/**
 * Transaction Monitoring Utilities
 * Tracks transaction status, confirmations, and provides real-time updates
 */

import { getTransactionDetails } from '../../services/bitcoin/blockchain'
import type { EsploraTransaction } from '../../types/blockchain.types'

export interface TransactionStatus {
  txid: string
  isConfirmed: boolean
  confirmations: number
  blockHeight?: number
  blockTime?: number
  fee: number
  status: 'pending' | 'confirmed' | 'failed' | 'replaced' | 'unknown'
  lastUpdated: number
}

export interface TransactionMonitorOptions {
  maxRetries?: number
  retryInterval?: number
  onStatusUpdate?: (status: TransactionStatus) => void
  onConfirmed?: (status: TransactionStatus) => void
  onFailed?: (error: string) => void
}

/**
 * Monitors a transaction until it's confirmed or fails
 */
export class TransactionMonitor {
  private txid: string
  private options: Required<TransactionMonitorOptions>
  private retryCount = 0
  private monitorInterval?: NodeJS.Timeout
  private isActive = false

  constructor(txid: string, options: TransactionMonitorOptions = {}) {
    this.txid = txid
    this.options = {
      maxRetries     : options.maxRetries ?? 30,
      retryInterval  : options.retryInterval ?? 30000, // 30 seconds
      onStatusUpdate : options.onStatusUpdate ?? (() => {}),
      onConfirmed    : options.onConfirmed ?? (() => {}),
      onFailed       : options.onFailed ?? (() => {})
    }
  }

  /**
   * Starts monitoring the transaction
   */
  start(): void {
    if (this.isActive) {
      console.warn('Transaction monitor already active')
      return
    }

    this.isActive = true
    this.retryCount = 0
    this.checkStatus()
  }

  /**
   * Stops monitoring the transaction
   */
  stop(): void {
    if (this.monitorInterval) {
      clearTimeout(this.monitorInterval)
      this.monitorInterval = undefined
    }
    this.isActive = false
  }

  /**
   * Checks transaction status once
   */
  async checkStatus(): Promise<TransactionStatus | null> {
    try {
      const txDetails = await getTransactionDetails(this.txid)
      const status = this.parseTransactionStatus(txDetails)
      
      this.options.onStatusUpdate(status)

      if (status.isConfirmed) {
        this.options.onConfirmed(status)
        this.stop()
        return status
      }

      if (status.status === 'failed') {
        this.options.onFailed('Transaction failed or was replaced')
        this.stop()
        return status
      }

      // Schedule next check if still active and under retry limit
      if (this.isActive && this.retryCount < this.options.maxRetries) {
        this.retryCount++
        this.monitorInterval = setTimeout(() => {
          this.checkStatus()
        }, this.options.retryInterval)
      } else if (this.retryCount >= this.options.maxRetries) {
        this.options.onFailed('Maximum monitoring attempts reached')
        this.stop()
      }

      return status

    } catch (error) {
      console.error('Error checking transaction status:', error)
      
      if (this.retryCount < this.options.maxRetries) {
        this.retryCount++
        this.monitorInterval = setTimeout(() => {
          this.checkStatus()
        }, this.options.retryInterval)
      } else {
        this.options.onFailed('Failed to fetch transaction status after maximum retries')
        this.stop()
      }

      return null
    }
  }

  /**
   * Parses Esplora transaction data into our status format
   */
  private parseTransactionStatus(tx: EsploraTransaction): TransactionStatus {
    const status: TransactionStatus = {
      txid          : tx.txid,
      isConfirmed   : tx.status.confirmed,
      confirmations : 0,
      fee           : tx.fee,
      status        : 'pending',
      lastUpdated   : Date.now()
    }

    if (tx.status.confirmed) {
      status.status = 'confirmed'
      status.blockHeight = tx.status.block_height ?? undefined
      status.blockTime = tx.status.block_time ?? undefined
      
      // Calculate confirmations (this would need current block height)
      // For now, confirmed = at least 1 confirmation
      status.confirmations = 1
    } else {
      status.status = 'pending'
    }

    return status
  }
}

/**
 * Simple function to check if a transaction is confirmed
 */
export async function isTransactionConfirmed(txid: string): Promise<boolean> {
  try {
    const txDetails = await getTransactionDetails(txid)
    return txDetails.status.confirmed
  } catch (error) {
    console.error('Error checking transaction confirmation:', error)
    return false
  }
}

/**
 * Gets basic transaction status without monitoring
 */
export async function getTransactionStatus(txid: string): Promise<TransactionStatus | null> {
  try {
    const txDetails = await getTransactionDetails(txid)
    return {
      txid          : txDetails.txid,
      isConfirmed   : txDetails.status.confirmed,
      confirmations : txDetails.status.confirmed ? 1 : 0,
      blockHeight   : txDetails.status.block_height ?? undefined,
      blockTime     : txDetails.status.block_time ?? undefined,
      fee           : txDetails.fee,
      status        : txDetails.status.confirmed ? 'confirmed' : 'pending',
      lastUpdated   : Date.now()
    }
  } catch (error) {
    console.error('Error fetching transaction status:', error)
    return null
  }
}

/**
 * Estimates when a pending transaction might be confirmed based on fee rate
 */
export function estimateConfirmationTime(
  feeRate: number,
  networkCongestion: 'low' | 'medium' | 'high' = 'medium'
): string {
  // Base confirmation times in minutes
  const baseTimes = {
    low    : { fast: 10, normal: 20, slow: 60, economy: 360 },
    medium : { fast: 20, normal: 40, slow: 120, economy: 720 },
    high   : { fast: 60, normal: 120, slow: 480, economy: 1440 }
  }

  const times = baseTimes[networkCongestion]

  if (feeRate >= 20) {
    return `${times.fast} minutes`
  } else if (feeRate >= 10) {
    return `${times.normal} minutes`
  } else if (feeRate >= 3) {
    return `${Math.round(times.slow / 60)} hours`
  } else {
    return `${Math.round(times.economy / 60)} hours`
  }
}

/**
 * Creates a human-readable transaction status message
 */
export function formatTransactionStatus(status: TransactionStatus): string {
  switch (status.status) {
    case 'confirmed':
      return `Confirmed with ${status.confirmations} confirmation${status.confirmations !== 1 ? 's' : ''}`
    case 'pending':
      return 'Pending confirmation...'
    case 'failed':
      return 'Transaction failed'
    case 'replaced':
      return 'Transaction was replaced'
    default:
      return 'Unknown status'
  }
}

/**
 * Utility to monitor multiple transactions
 */
export class MultiTransactionMonitor {
  private monitors: Map<string, TransactionMonitor> = new Map()

  /**
   * Adds a transaction to monitor
   */
  addTransaction(txid: string, options: TransactionMonitorOptions = {}): void {
    if (this.monitors.has(txid)) {
      console.warn(`Transaction ${txid} is already being monitored`)
      return
    }

    const monitor = new TransactionMonitor(txid, options)
    this.monitors.set(txid, monitor)
    monitor.start()
  }

  /**
   * Removes a transaction from monitoring
   */
  removeTransaction(txid: string): void {
    const monitor = this.monitors.get(txid)
    if (monitor) {
      monitor.stop()
      this.monitors.delete(txid)
    }
  }

  /**
   * Stops monitoring all transactions
   */
  stopAll(): void {
    this.monitors.forEach(monitor => monitor.stop())
    this.monitors.clear()
  }

  /**
   * Gets status of all monitored transactions
   */
  async getAllStatuses(): Promise<Record<string, TransactionStatus | null>> {
    const statuses: Record<string, TransactionStatus | null> = {}
    
    for (const [ txid, monitor ] of this.monitors) {
      statuses[txid] = await monitor.checkStatus()
    }
    
    return statuses
  }
} 