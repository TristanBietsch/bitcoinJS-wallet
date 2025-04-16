import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { mockTransactions } from '@/tests/mockData/transactionData'

// Simulated transaction processing - in real app this would be a real API call
const simulateTransaction = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate 90% success rate
  const isSuccess = Math.random() < 0.9
  
  if (!isSuccess) {
    throw new Error('Transaction failed. Please try again.')
  }
  
  // Return a new transaction ID
  return (mockTransactions.length + 1).toString()
}

export default function SendLoadingScreen() {
  const router = useRouter()
  const [ error, setError ] = useState<string | null>(null)
  
  useEffect(() => {
    const processTransaction = async () => {
      try {
        const transactionId = await simulateTransaction()
        
        // Navigate to success screen, using the app/send/success.tsx route
        router.replace({
          pathname : '/send/success',
          params   : { transactionId }
        } as any)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transaction failed')
      }
    }
    
    processTransaction()
  }, [ router ])
  
  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <ThemedText 
          style={styles.retryText}
          onPress={() => router.back()}
        >
          Go back and try again
        </ThemedText>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={Colors.light.electricBlue} />
      <ThemedText style={styles.loadingText}>
        Processing your transaction...
      </ThemedText>
      <ThemedText style={styles.subText}>
        This may take a few moments
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    backgroundColor   : Colors.light.background,
    paddingHorizontal : 20,
  },
  loadingText : {
    fontSize     : 20,
    fontWeight   : '600',
    marginTop    : 24,
    marginBottom : 8,
  },
  subText : {
    fontSize : 16,
    color    : '#666',
  },
  errorText : {
    fontSize     : 18,
    color        : '#DC2626',
    marginBottom : 16,
    textAlign    : 'center',
  },
  retryText : {
    fontSize  : 16,
    color     : Colors.light.electricBlue,
    textAlign : 'center',
  },
}) 