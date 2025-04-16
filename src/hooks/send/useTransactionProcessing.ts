/**
 * Hook for handling transaction processing logic
 */
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { mockTransactions } from '@/tests/mockData/transactionData'

// Find an existing "send" transaction to use as reference
const getExistingSendTransaction = () => {
  const sendTransaction = mockTransactions.find(tx => tx.type === 'send')
  return sendTransaction?.id || '2' // ID 2 is a send transaction in mock data
}

// Simulated transaction processing - in real app this would be a real API call
const simulateTransaction = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate 90% success rate
  const isSuccess = Math.random() < 0.9
  
  if (!isSuccess) {
    throw new Error('Transaction failed. Please try again.')
  }
  
  // Return an existing transaction ID that we know works
  return getExistingSendTransaction()
}

interface TransactionProcessingResult {
  error: string | null
  isLoading: boolean
}

/**
 * Hook to handle transaction processing and navigation after completion
 */
export const useTransactionProcessing = (): TransactionProcessingResult => {
  const router = useRouter()
  const [ error, setError ] = useState<string | null>(null)
  const [ isLoading, setIsLoading ] = useState(true)
  
  useEffect(() => {
    const processTransaction = async () => {
      try {
        const transactionId = await simulateTransaction()
        
        // Navigate to success screen, using the app/send/success.tsx route
        router.replace({
          pathname : '/send/success',
          params   : { transactionId }
        } as any)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transaction failed')
        setIsLoading(false)
      }
    }
    
    processTransaction()
  }, [ router ])
  
  return { error, isLoading }
} 