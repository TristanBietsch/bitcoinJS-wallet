import { useState, useCallback } from 'react'
import { Animated } from 'react-native'

/**
 * Hook for handling fade animation transitions
 * @param initialValue Initial opacity value (default: 1)
 * @param fadeDuration Duration of the fade animation in ms (default: 150)
 * @returns Object with fadeAnim value and fadeTransition function
 */
export const useFadeAnimation = (initialValue = 1, fadeDuration = 150) => {
  // Create animated value for opacity
  const [ fadeAnim ] = useState(new Animated.Value(initialValue))
  
  /**
   * Performs a fade transition when a value changes
   * @param callback Function to execute during the transition
   */
  const fadeTransition = useCallback((callback: () => void) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue         : 0,
      duration        : fadeDuration,
      useNativeDriver : true,
    }).start(() => {
      // Execute callback when faded out
      callback()
      
      // Fade back in
      Animated.timing(fadeAnim, {
        toValue         : 1,
        duration        : fadeDuration,
        useNativeDriver : true,
      }).start()
    })
  }, [ fadeAnim, fadeDuration ])
  
  return { fadeAnim, fadeTransition }
} 