import * as Haptics from 'expo-haptics'

/**
 * Hook for handling haptic feedback throughout the app
 * Abstracts the Expo Haptics API for easier use
 */
export const useHaptics = () => {
  const lightImpact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const mediumImpact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const heavyImpact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }

  const selectionImpact = () => {
    Haptics.selectionAsync()
  }

  const notificationSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const notificationWarning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }

  const notificationError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionImpact,
    notificationSuccess,
    notificationWarning,
    notificationError,
  }
} 