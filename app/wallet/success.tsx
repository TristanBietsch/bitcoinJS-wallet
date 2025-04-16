import { Stack } from 'expo-router'
import SuccessScreen from '@/src/screens/wallet/Send/SendSuccessScreen'

export default function SuccessPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown : false
        }}
      />
      <SuccessScreen />
    </>
  )
} 