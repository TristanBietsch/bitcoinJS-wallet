import { Stack } from 'expo-router'

export default function TransactionLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown : true,
          title       : 'Transaction Details',
        }}
      />
    </Stack>
  )
} 