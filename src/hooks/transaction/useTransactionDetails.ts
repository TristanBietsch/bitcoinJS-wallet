import { useState, useEffect } from 'react'
import { Transaction } from '@/src/types/transaction'
import { mockTransactions } from '@/tests/mockData/transactionData'

// Mock conversion rate: 1 USD = 42105.26 sats (approximately $23,750 per BTC)
const USD_TO_SATS_RATE = 42105.26

/**
 * Hook for fetching and managing transaction details
 * @param transactionId - The ID of the transaction to fetch
 */
export function useTransactionDetails(transactionId: string | undefined) {
  const [ transaction, setTransaction ] = useState<Transaction | null>(null)
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      // Reset state when transaction ID changes
      setLoading(true)
      setError(null)
      
      if (!transactionId) {
        setTransaction(null)
        setLoading(false)
        return
      }
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Find the transaction in mockTransactions
        const foundTransaction = mockTransactions.find(tx => tx.id === transactionId)
        
        if (!foundTransaction) {
          throw new Error('Transaction not found')
        }

        // Convert USD amounts to sats
        const amountInSats = Math.round(foundTransaction.amount * USD_TO_SATS_RATE)
        const feeInSats = foundTransaction.fee ? Math.round(foundTransaction.fee * USD_TO_SATS_RATE) : undefined
        const totalInSats = feeInSats ? amountInSats + feeInSats : amountInSats

        // Transform the transaction data to match the UI needs
        const transformedTransaction: Transaction = {
          id         : foundTransaction.id,
          type       : foundTransaction.type,
          amount     : amountInSats,
          currency   : 'sats',
          date       : new Date(foundTransaction.timestamp),
          recipient  : foundTransaction.address,
          status     : foundTransaction.status === 'confirmed' ? 'completed' : foundTransaction.status,
          fee        : feeInSats,
          txid       : foundTransaction.hash,
          // Original USD values
          fiatAmount : `= $${foundTransaction.amount.toFixed(2)} USD`,
          fiatFee    : foundTransaction.fee ? `= $${foundTransaction.fee.toFixed(2)} USD` : undefined,
          fiatTotal  : `= $${(foundTransaction.amount + (foundTransaction.fee || 0)).toFixed(2)} USD`,
          total      : totalInSats,
          feeRate    : feeInSats ? '5' : undefined,
        }
        
        setTransaction(transformedTransaction)
      } catch (err) {
        console.error('Error fetching transaction:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch transaction'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchTransaction()
  }, [ transactionId ])

  return {
    transaction,
    loading,
    error
  }
} 