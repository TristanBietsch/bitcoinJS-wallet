import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'

/**
 * Navigation utilities for the send flow
 */
export const useSendNavigation = () => {
  const router = useRouter()
  const { setErrorMode } = useSendStore()
  
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
    // Reset error mode when going back
    setErrorMode('none')
    router.back()
  }
  
  return {
    navigateToSendLoading,
    navigateBack
  }
} 