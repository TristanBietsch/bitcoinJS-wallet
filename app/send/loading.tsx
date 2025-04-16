import { Stack } from 'expo-router'
import SendLoadingScreen from '@/src/screens/wallet/Send/SendLoadingScreen'

export default function LoadingPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown : false
        }}
      />
      <SendLoadingScreen />
    </>
  )
} 