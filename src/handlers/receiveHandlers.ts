/**
 * Handlers for receive screen operations
 */
import { useRouter } from 'expo-router'
import { useReceiveStore } from '@/src/store/receiveStore'
import { isValidReceiveAmount } from '@/src/utils/validation/receiveValidation'

/**
 * Hook for receive screen handlers
 */
export const useReceiveHandlers = () => {
  const router = useRouter()
  const { amount, currency } = useReceiveStore()
  
  /**
   * Navigate back to home
   */
  const handleBackPress = () => {
    router.push('/')
  }
  
  /**
   * Generate QR invoice and navigate to invoice screen
   */
  const handleGenerateQR = () => {
    router.push({
      pathname : '/receive/invoice' as any,
      params   : {
        amount,
        currency
      }
    })
  }
  
  /**
   * Check if the current amount is valid for generating an invoice
   */
  const isAmountValid = (): boolean => {
    return isValidReceiveAmount(amount)
  }
  
  return {
    handleBackPress,
    handleGenerateQR,
    isAmountValid
  }
} 