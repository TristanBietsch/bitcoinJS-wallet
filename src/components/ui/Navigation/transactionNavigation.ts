import { useRouter } from 'expo-router'
import { Transaction } from '@/src/types/domain/transaction/transaction.types'

/**
 * Navigation utilities for transaction-related screens
 */
export const useTransactionNavigation = () => {
  const router = useRouter()
  
  /**
   * Navigate to the transaction details screen
   * @param transaction The transaction to view details for
   */
  const navigateToTransactionDetails = (transaction: Transaction) => {
    router.push({
      pathname : '/transaction/[id]',
      params   : { id: transaction.id }
    } as any)
  }
  
  return {
    navigateToTransactionDetails
  }
} 