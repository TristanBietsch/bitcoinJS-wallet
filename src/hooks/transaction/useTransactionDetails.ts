import { useState, useEffect } from 'react'
import { Transaction } from '@/src/types/transaction'
import { getTransactionById } from '@/src/services/transaction'

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
        const txData = await getTransactionById(transactionId)
        setTransaction(txData)
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