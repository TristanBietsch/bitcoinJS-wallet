import React from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import SendCameraScreen from '@/src/screens/wallet/Send/SendCameraScreen'

// Make sure the name matches exactly what we're navigating to
export default function Camera() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <SendCameraScreen />
    </View>
  )
} 