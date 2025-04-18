import { Stack } from 'expo-router'
import SendSuccessScreen from '@/src/screens/wallet/Receive/Send/SendSuccessScreen'

export default function SuccessPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown : false
        }}
      />
      <SendSuccessScreen />
    </>
  )
} 