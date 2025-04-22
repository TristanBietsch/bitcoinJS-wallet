import { router } from 'expo-router'

/**
 * Hook for handling menu screen navigation
 */
export const useMenuNavigation = () => {
  /**
   * Handles closing the menu (going back)
   */
  const handleClose = () => {
    router.back()
  }

  /**
   * Handles navigation to a specific route
   */
  const handleNavigation = (route: string) => {
    router.push(route as any)
  }

  return {
    handleClose,
    handleNavigation
  }
} 