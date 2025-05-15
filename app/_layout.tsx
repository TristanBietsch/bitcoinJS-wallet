// Direct import of regenerator-runtime
import 'regenerator-runtime/runtime'

import React, { useEffect } from 'react'
import "@/global.css"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppProvider } from '@/src/components/layout/Container'
import { TabBottomNavigation } from '@/src/components/ui/Navigation'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { usePathname, Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useWalletStore } from '@/src/store/walletStore'
import { scheduleKeyRotation } from '@/src/utils/security/keyRotationUtils'

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

export default function RootLayout() {
  const pathname = usePathname()
  
  // Get wallet initialization function from our store
  const initializeWallet = useWalletStore(state => state.initializeWallet)
  
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
