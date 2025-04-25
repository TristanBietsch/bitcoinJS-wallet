import React, { useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import LottieView from 'lottie-react-native'

interface ConfettiAnimationProps {
  autoPlay?: boolean
  loop?: boolean
  delay?: number
}

/**
 * A reusable confetti animation component for celebration moments
 */
const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  autoPlay = false,
  loop = false,
  delay = 100
}) => {
  // Reference to the animation
  const animationRef = useRef<LottieView>(null)
  
  // Play animation once when component mounts (if not autoPlay)
  useEffect(() => {
    if (!autoPlay && animationRef.current) {
      // Small delay to ensure animation is properly loaded
      const timer = setTimeout(() => {
        animationRef.current?.play()
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [ autoPlay, delay ])
  
  return (
    <View style={styles.animationContainer}>
      <LottieView
        ref={animationRef}
        source={require('@/assets/animations/confetti.json')}
        style={styles.animation}
        loop={loop}
        autoPlay={autoPlay}
        resizeMode="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  animationContainer : {
    position      : 'absolute',
    top           : 0,
    left          : 0,
    right         : 0,
    bottom        : 0,
    zIndex        : 10,
    pointerEvents : 'none' // Allow interactions with elements behind the animation
  },
  animation : {
    width  : '100%',
    height : '100%'
  }
})

export default ConfettiAnimation 