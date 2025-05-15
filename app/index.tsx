import React, { useEffect, useState } from 'react'
import HomeScreen from '@/src/screens/main/home/HomeScreen'
import { isOnboardingComplete, resetOnboardingStatus } from '@/src/utils/storage'
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { Colors } from '@/src/constants/colors'
import { useWallet } from '@/src/context/WalletContext'

export default function Home() {
  const [ isChecking, setIsChecking ] = useState(true)
  const { loadWallet, isLoading: isWalletLoading } = useWallet()

  // Combined loading state  
  const isLoading = isChecking || isWalletLoading

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingComplete()
      console.log('Onboarding status:', completed ? 'completed' : 'not completed')
      
      if (!completed) {
        // Redirect to onboarding route if not completed
        router.push('/onboarding' as any)
      } else {
        // If onboarding is complete, load the wallet
        await loadWallet()
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // If there's an error, we'll assume onboarding needs to be done
      router.push('/onboarding' as any)
    } finally {
      setIsChecking(false)
    }
  }

  const handleResetOnboarding = async () => {
    await resetOnboardingStatus()
    router.push('/onboarding' as any)
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.buttons.primary} />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    )
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
  loadingContainer : {
    flex            : 1,
    backgroundColor : '#FFFFFF',
    justifyContent  : 'center',
    alignItems      : 'center',
  },
  loadingText : {
    marginTop  : 20,
    fontSize   : 16,
    color      : Colors.light.text,
    fontWeight : '500',
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