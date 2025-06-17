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
 * Provides smart back navigation based on the source of navigation
 */
export const useTransactionDetailsNavigation = (): TransactionDetailsNavigationResult => {
  const router = useRouter()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  
  const navigateBack = () => {
    // Debug logging to see what params we're getting
    console.log('🔍 [TransactionDetailsNavigation] Params:', params)
    console.log('🔍 [TransactionDetailsNavigation] Source param:', params.source)
    
    // Check if we came from the send success screen
    if (params.source === 'send-success') {
      console.log('🏠 [TransactionDetailsNavigation] Navigating to home from send-success')
      // Navigate to home instead of going back in the stack (using correct home route)
      router.replace('/' as any)
    } else {
      console.log('🔙 [TransactionDetailsNavigation] Using normal back navigation')
      // Normal back navigation for all other cases
      router.back()
    }
  }
  
  return {
    id : params.id as string || '',
    navigateBack
  }
} 