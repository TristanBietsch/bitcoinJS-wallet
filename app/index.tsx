import React, { useEffect, useState } from 'react'
import HomeScreen from '@/src/screens/main/home/HomeScreen'
import { isOnboardingComplete } from '@/src/utils/storage'
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { useWalletStore } from '@/src/store/walletStore'
import logger, { LogScope } from '@/src/utils/logger'
import { Colors } from '@/src/constants/colors'


export default function Home() {
  const [ isChecking, setIsChecking ] = useState(true)
  
  const isInitialized = useWalletStore(state => state.isInitialized)
  const isSyncing = useWalletStore(state => state.isSyncing)
  const wallet = useWalletStore(state => state.wallet)

  // Log wallet state changes for diagnostics
  useEffect(() => {
    const status = isInitialized ? 'initialized' : 'uninitialized'
    const syncStatus = isSyncing ? 'syncing' : 'idle'
    logger.state('Home', `${status}, ${syncStatus}`)
    if (wallet) {
      logger.wallet('State updated', wallet)
    }
  }, [ isInitialized, isSyncing, wallet ])

  // Only show loading when initializing for the first time
  // Otherwise, wallet data will be loaded silently in the background
  const isLoading = isChecking || (!isInitialized && isSyncing)

  // Use a separate effect to check onboarding status on component mount only
  useEffect(() => {
    const runCheck = async () => {
      await checkOnboardingStatus()
    }
    
    // Call the async function
    runCheck()
  }, []) // Empty dependency array ensures this runs only once

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingComplete()
      logger.init(`Onboarding status: ${completed ? 'completed' : 'pending'}`)
      
      if (!completed) {
        // Redirect to onboarding route if not completed
        router.push('/onboarding' as any)
      }
      // No else block to reduce unnecessary code execution
    } catch (error) {
      logger.error(LogScope.INIT, 'Error checking onboarding status', error)
      // If there's an error, we'll assume onboarding needs to be done
      router.push('/onboarding' as any)
    } finally {
      setIsChecking(false)
    }
  }

  const handleResetOnboarding = async () => {
    try {
      // Clear all wallet data
      await useWalletStore.getState().clearWallet()
      
      // Clear all AsyncStorage keys for a complete reset
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
      await AsyncStorage.clear()
      
      logger.storage('Complete app reset - all data cleared')
      
      // Navigate back to onboarding
      router.push('/onboarding' as any)
    } catch (error) {
      logger.error(LogScope.STORAGE, 'Error resetting app', error)
      // Still try to navigate to onboarding even if there was an error
      router.push('/onboarding' as any)
    }
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