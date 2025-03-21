import React from 'react'
import "@/global.css"
import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider"
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  return (
    <GluestackUIProvider mode="light"><SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider></GluestackUIProvider>
  )
} 