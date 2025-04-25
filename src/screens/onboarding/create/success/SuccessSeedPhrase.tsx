import React, { useRef, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Check } from 'lucide-react-native'
import { router } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'
import { setOnboardingComplete } from '@/src/utils/storage'
import LottieView from 'lottie-react-native'

interface SuccessSeedPhraseProps {
  onComplete?: () => void
}

export default function SuccessSeedPhrase({ onComplete }: SuccessSeedPhraseProps) {
  // Reference to the animation
  const animationRef = useRef<LottieView>(null)
  
  // Play animation once when component mounts
  useEffect(() => {
    if (animationRef.current) {
      // Small delay to ensure animation is properly loaded
      setTimeout(() => {
        animationRef.current?.play()
      }, 100)
    }
  }, [])
  
  const handleGoHome = async () => {
    try {
      // First, mark onboarding as complete in storage
      await setOnboardingComplete()
      
      // Then navigate to home screen
      router.replace('/' as any)
      
      // Also call onComplete if provided (for backward compatibility)
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still try to navigate even if there was an error
      router.replace('/' as any)
    }
  }
  
  return (
    <OnboardingContainer>
      {/* Lottie animation overlay - positioned absolutely to cover the screen */}
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          source={require('@/assets/animations/confetti.json')}
          style={styles.animation}
          loop={false}
          autoPlay={false}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Success!
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Your wallet is ready to go.
        </ThemedText>
        
        <View style={styles.iconContainer}>
          <Check 
            size={90} 
            color={Colors.light.successGreen} 
            strokeWidth={2}
          />
        </View>
      </View>
      
      <OnboardingButton
        label="Go Home"
        onPress={handleGoHome}
        style={styles.homeButton}
      />
    </OnboardingContainer>
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
  },
  content : {
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    paddingHorizontal : 20
  },
  title : {
    fontSize     : 32,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10
  },
  subtitle : {
    fontSize     : 18,
    textAlign    : 'center',
    marginBottom : 60
  },
  iconContainer : {
    width           : 160,
    height          : 160,
    borderRadius    : 80,
    backgroundColor : Colors.light.successIconBg,
    alignItems      : 'center',
    justifyContent  : 'center',
    marginVertical  : 40
  },
  homeButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 30,
    width           : '100%'
  }
})
