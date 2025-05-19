/**
 * Common callback interfaces for UI components
 */

/**
 * Base callback interface with common navigation methods
 */
export interface BaseCallbacks {
  onComplete?: () => void
  onBack?: () => void
}

/**
 * Extended callbacks including error handling
 */
export interface ErrorHandlingCallbacks extends BaseCallbacks {
  onError?: () => void
  onTryAgain?: () => void
} 