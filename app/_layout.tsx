// Direct import of regenerator-runtime
import 'regenerator-runtime/runtime'

import React, { useEffect, useRef, useState } from 'react'
import "@/global.css"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppProvider } from '@/src/components/layout/Container'
import { TabBottomNavigation } from '@/src/components/ui/Navigation'
import { View, AppState, AppStateStatus } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { usePathname, Slot, router } from 'expo-router'
import { useFonts } from 'expo-font'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useWalletStore } from '@/src/store/walletStore'
import { scheduleKeyRotation } from '@/src/utils/security/keyRotationUtils'
import { isOnboardingComplete } from '@/src/utils/storage'

// Routes where bottom navigation should be hidden
const HIDDEN_NAV_ROUTES = [ '/receive', '/send', '/transaction', '/onboarding', '/about', '/settings', '/support', '/main/menu', '/main/qr' ]

const LOCK_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

export default function RootLayout() {
  const pathname = usePathname()
  const appState = useRef(AppState.currentState)
  const [lastActiveTime, setLastActiveTime] = useState<number>(Date.now())
  
  // Get wallet initialization function from our store
  const initializeWallet = useWalletStore(state => state.initializeWallet)
  const clearWallet = useWalletStore(state => state.clearWallet)
  const wallet = useWalletStore(state => state.wallet)
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!')
        const timeInBackground = Date.now() - lastActiveTime
        if (timeInBackground > LOCK_TIMEOUT && wallet) {
          console.log('App was in background for too long. Locking wallet.')
          await clearWallet() // This clears seed phrase from memory and wallet object
          // Wallet will be re-initialized by initializeWallet() or user action if needed
          // Optionally, navigate to a specific screen or show a lock overlay
          // For now, relying on initializeWallet to repopulate if user navigates to wallet areas.
          // Or, force re-initialization if not on onboarding
          const onboardingCompleted = await isOnboardingComplete()
          if (onboardingCompleted) {
             // If onboarding is done, and we just cleared the wallet, re-initialize it.
             // This will prompt for decryption if necessary or load from store.
            initializeWallet()
          } else {
            // If onboarding is not complete, go to onboarding screen
            router.replace('/onboarding' as any)
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('App has gone to the background or become inactive.')
        setLastActiveTime(Date.now())
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [ lastActiveTime, clearWallet, wallet, initializeWallet ])
  
  // Initialize wallet and security features when app loads
  useEffect(() => {
    // Initialize wallet from secure storage
    initializeWallet()
    
    // Schedule encryption key rotation (returns cleanup function)
    const cleanupKeyRotation = scheduleKeyRotation()
    
    // Clean up when component unmounts
    return () => {
      cleanupKeyRotation()
    }
  }, [ initializeWallet ])
  
  // Check if bottom navigation should be hidden for current route
  const shouldHideNav = HIDDEN_NAV_ROUTES.some(route => pathname.startsWith(route))
  
  const [ fontsLoaded ] = useFonts({
    SpaceMono : require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <AppProvider>
          <View style={styles.content}>
            <Slot />
          </View>
          {!shouldHideNav && <TabBottomNavigation />}
          <StatusBar style="auto" />
        </AppProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#ffffff',
  },
  content : {
    flex            : 1,
    backgroundColor : '#ffffff',
  },
})
