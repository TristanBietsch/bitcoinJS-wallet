import { Stack } from 'expo-router'
import TransactionDetailsScreen from '@/src/screens/wallet/TransactionDetails/TransactionDetailsScreen'

export default function TransactionPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown : false
        }}
      />
      <TransactionDetailsScreen />
    </>
  )
} 