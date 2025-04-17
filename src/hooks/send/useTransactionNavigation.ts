/**
 * Hook for handling transaction-related navigation
 */
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'

interface TransactionNavigationResult {
  transactionId: string
  navigateToHome: () => void
  navigateToDetails: () => void
}

/**
 * Hook to handle navigation from transaction screens
 */
export const useTransactionNavigation = (): TransactionNavigationResult => {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  const { setForceError } = useSendStore()
  
  // Get transaction ID from params or use default
  const transactionId = params.transactionId as string || '2' // ID 2 is a send transaction in mock data
  
  // Navigate to home screen
  const navigateToHome = () => {
    // Reset forceError flag when navigating away
    setForceError(false)
    router.replace('/')
  }
  
  // Navigate to transaction details
  const navigateToDetails = () => {
    // Reset forceError flag when navigating away
    setForceError(false)
    router.push({
      pathname : '/transaction/[id]',
      params   : { id: transactionId }
    } as any)
  }
  
  return {
    transactionId,
    navigateToHome,
    navigateToDetails
  }
} 