import { useState, useEffect } from 'react'
import { Transaction } from '@/src/types/transaction'
import { mockTransactionDetails } from '@/tests/mockData/transactionData'

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
        
        // In a real app, we would fetch transaction data from an API
        // For now, we're just using mock data
        setTransaction(mockTransactionDetails as unknown as Transaction)
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