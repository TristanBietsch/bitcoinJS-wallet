import { Stack } from 'expo-router'
import SuccessScreen from '@/src/screens/wallet/Success/SuccessScreen'

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