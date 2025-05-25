import { Colors } from '@/src/constants/colors'

/**
 * Possible status types for feedback screens
 */
export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading'

/**
 * Status colors mapping for consistent UI
 */
export const getStatusColors = (statusType: StatusType) => {
  switch (statusType) {
    case 'success':
      return {
        icon       : Colors.light.successGreen,
        background : Colors.light.successIconBg
      }
    case 'error':
      return {
        icon       : Colors.light.errorRed,
        background : Colors.light.errorIconBg
      }
    case 'warning':
      return {
        icon       : '#E8AB2F', // Amber color for warnings
        background : 'rgba(232, 171, 47, 0.15)' // Light amber background
      }
    case 'info':
      return {
        icon       : Colors.light.buttons.primary,
        background : 'rgba(75, 130, 255, 0.15)' // Light blue background
      }
    case 'loading':
      return {
        icon       : Colors.light.buttons.primary,
        background : 'rgba(75, 130, 255, 0.15)' // Light blue background
      }
    default:
      return {
        icon       : Colors.light.text,
        background : '#F5F5F5'
      }
  }
}

/**
 * Options for status screen configuration
 */
export interface StatusScreenOptions {
  type: StatusType
  title: string
  subtitle?: string
  showAnimation?: boolean
  primaryButtonLabel?: string
  secondaryButtonLabel?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  onBack?: () => void
  useLeftArrow?: boolean
} 