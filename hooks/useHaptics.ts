import * as Haptics from 'expo-haptics';

/**
 * Hook for handling haptic feedback throughout the app
 * Abstracts the Expo Haptics API for easier use
 */
export const useHaptics = () => {
  const triggerImpact = (
    style: 'light' | 'medium' | 'heavy' = 'medium'
  ) => {
    const intensity = 
      style === 'light' 
        ? Haptics.ImpactFeedbackStyle.Light 
        : style === 'medium' 
          ? Haptics.ImpactFeedbackStyle.Medium 
          : Haptics.ImpactFeedbackStyle.Heavy;
    
    Haptics.impactAsync(intensity);
  };

  const triggerNotification = (
    type: 'success' | 'warning' | 'error' = 'success'
  ) => {
    const notificationType = 
      type === 'success' 
        ? Haptics.NotificationFeedbackType.Success 
        : type === 'warning' 
          ? Haptics.NotificationFeedbackType.Warning 
          : Haptics.NotificationFeedbackType.Error;
    
    Haptics.notificationAsync(notificationType);
  };

  const triggerSelection = () => {
    Haptics.selectionAsync();
  };

  return {
    triggerImpact,
    triggerNotification,
    triggerSelection
  };
}; 