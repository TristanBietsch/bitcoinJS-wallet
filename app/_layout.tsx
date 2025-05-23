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
// import { scheduleKeyRotation } from '@/src/utils/security/keyRotationUtils' // Temporarily removed
import { isOnboardingComplete } from '@/src/utils/storage'
import logger, { LogScope } from '@/src/utils/logger'

// Routes where bottom navigation should be hidden
const HIDDEN_NAV_ROUTES = [
  '/receive',
  '/send',
  '/transaction',
  '/onboarding',
  '/about',
  '/settings',
  '/support',
  '/main/menu',
  '/main/qr'
]

const LOCK_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

export default function RootLayout() {
  const pathname = usePathname()
  const appState = useRef(AppState.currentState)
  const [ lastActiveTime, setLastActiveTime ] = useState<number>(Date.now())
  const [ isAppInitialized, setIsAppInitialized ] = useState(false)
  
  // Get wallet initialization function from our store
  const initializeWallet = useWalletStore(state => state.initializeWallet)
  const clearWallet = useWalletStore(state => state.clearWallet)
  const wallet = useWalletStore(state => state.wallet)
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        logger.success(LogScope.INIT, 'App resumed from background')
        const timeInBackground = Date.now() - lastActiveTime
        if (timeInBackground > LOCK_TIMEOUT && wallet) {
          logger.info(LogScope.INIT, 'Auto-lock triggered after background timeout')
          await clearWallet()
          const onboardingCompleted = await isOnboardingComplete()
          if (onboardingCompleted) {
            initializeWallet()
          } else {
            router.replace('/onboarding' as any)
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        logger.info(LogScope.INIT, 'App entered background/inactive state')
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
    if (isAppInitialized) {
      return // Already initialized, do nothing
    }

    const initApp = async () => {
      try {
        logger.initProgress('Starting app initialization')
        await initializeWallet()
        
        if (!useWalletStore.getState().wallet && !pathname.includes('onboarding')) {
          logger.init('No wallet found, redirecting to onboarding')
          router.replace('/onboarding' as any)
        } else {
          logger.init('App initialization completed')
        }
      } catch (error) {
        logger.error(LogScope.INIT, 'Failed to initialize wallet', error)
        if (!pathname.includes('onboarding')) {
          router.replace('/onboarding' as any)
        }
      } finally {
        setIsAppInitialized(true) // Mark as initialized regardless of outcome to prevent re-looping this specific logic
      }
    }
    
    initApp()
    
    // Key rotation scheduling is temporarily disabled
    // const cleanupKeyRotation = scheduleKeyRotation()
    
    // return () => {
    //   cleanupKeyRotation()
    // }
  }, [ initializeWallet, pathname, isAppInitialized ])
  
  // Check if bottom navigation should be hidden for current route
  const shouldHideNav = HIDDEN_NAV_ROUTES.some(route => pathname.startsWith(route))
  
  const [ fontsLoaded ] = useFonts({
    SpaceMono : require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }
  
  if (!isAppInitialized && fontsLoaded) {
    // Optionally return a global loading screen until isAppInitialized is true
    // For simplicity, we currently allow Slot to render, and initApp handles redirection.
  }

  return (
    <>
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
    </>
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
