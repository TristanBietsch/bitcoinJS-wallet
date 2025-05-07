import React, { useEffect, useState } from 'react'
import HomeScreen from '@/src/screens/main/home/HomeScreen'
import { isOnboardingComplete, resetOnboardingStatus } from '@/src/utils/storage'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { Colors } from '@/src/constants/colors'

export default function Home() {
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingComplete()
      console.log('Onboarding status:', completed ? 'completed' : 'not completed')
      setIsLoading(false)
      
      // Redirect to onboarding route if not completed
      if (!completed) {
        router.push('/onboarding' as any)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setIsLoading(false)
      // If there's an error, we'll assume onboarding needs to be done
      router.push('/onboarding' as any)
    }
  }

  const handleResetOnboarding = async () => {
    await resetOnboardingStatus()
    router.push('/onboarding' as any)
  }

  if (isLoading) {
    return null // Or return a loading spinner
  }

  // If onboarding should be shown, this screen will redirect to /onboarding
  // Otherwise, show the home screen
  return (
    <View style={styles.container}>
      <HomeScreen />
      {Constants.appOwnership === 'expo' || __DEV__ ? (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetOnboarding}
        >
          <Text style={styles.resetButtonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#FFFFFF',
  },
  resetButton : {
    position        : 'absolute',
    bottom          : 120, // Increased to be above the navigation bar
    right           : 20,
    backgroundColor : Colors.light.buttons.primary,
    padding         : 10,
    borderRadius    : 8,
    opacity         : 0.8,
  },
  resetButtonText : {
    color    : Colors.light.buttons.text,
    fontSize : 12,
  },
}) 