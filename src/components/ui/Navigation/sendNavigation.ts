import { useRouter } from 'expo-router'

/**
 * Navigation utilities for the send flow
 */
export const useSendNavigation = () => {
  const router = useRouter()
  
  /**
   * Navigate to the send loading screen
   */
  const navigateToSendLoading = () => {
    router.replace('/send/loading' as any)
  }
  
  /**
   * Navigate back to the previous screen
   */
  const navigateBack = () => {
    router.back()
  }
  
  return {
    navigateToSendLoading,
    navigateBack
  }
} 