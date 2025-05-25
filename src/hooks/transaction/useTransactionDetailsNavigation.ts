/**
 * Hook for transaction details navigation
 */
import { useRouter, useLocalSearchParams } from 'expo-router'

interface TransactionDetailsNavigationResult {
  id: string
  navigateBack: () => void
}

/**
 * Hook to handle navigation for the transaction details screen
 */
export const useTransactionDetailsNavigation = (): TransactionDetailsNavigationResult => {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  
  const navigateBack = () => {
    router.back()
  }
  
  return {
    id : params.id as string || '',
    navigateBack
  }
} 