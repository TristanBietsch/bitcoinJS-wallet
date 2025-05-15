// Direct import of regenerator-runtime
import 'regenerator-runtime/runtime'

import React, { useCallback } from 'react'
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
  
  // Check if bottom navigation should be hidden for current route
  const shouldHideNav = HIDDEN_NAV_ROUTES.some(route => pathname.startsWith(route))
  
  const [ fontsLoaded ] = useFonts({
    SpaceMono : require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  // Memoize the content to prevent unnecessary re-renders during navigation
  const renderContent = useCallback(() => {
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
  }, [ fontsLoaded, shouldHideNav ])

  return renderContent()
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
