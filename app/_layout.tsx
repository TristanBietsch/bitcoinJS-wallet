// Import regeneratorRuntime polyfill
import '../regeneratorRuntime'

import React from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import "@/global.css"
import { GluestackUIProvider } from "@/src/components/common/Provider"
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomNavigation } from '@/src/components/common/BottomNavigation'
import { Slot, usePathname } from 'expo-router'
import { initSentry } from '@/src/services/logging/sentryService'

import { useColorScheme } from '@/src/hooks/useColorScheme'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Routes where bottom navigation should be hidden
const HIDDEN_NAV_ROUTES = [ '/payment', '/receive', '/send' ]

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const pathname = usePathname()
  
  // Check if bottom navigation should be hidden for current route
  const shouldHideNav = HIDDEN_NAV_ROUTES.some(route => pathname.startsWith(route))
  
  const [ loaded, error ] = useFonts({
    SpaceMono : require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (error) throw error
  }, [ error ])

  useEffect(() => {
    if (loaded) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [ loaded ])

  // Initialize Sentry after component mounts
  useEffect(() => {
    initSentry()
  }, [])

  // Prevent rendering until the font has loaded or an error was returned
  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={styles.content}>
            <Slot />
          </View>
          {!shouldHideNav && <BottomNavigation />}
          <StatusBar style="auto" />
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },
  content : {
    flex : 1,
  },
})
