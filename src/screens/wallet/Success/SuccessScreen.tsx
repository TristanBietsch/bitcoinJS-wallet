import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Check } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { mockTransactions } from '@/tests/mockData/transactionData'

export default function SuccessScreen() {
  const router = useRouter()

  const handleGoHome = () => {
    router.replace('/')
  }

  const handleViewDetails = () => {
    // For now, we'll use the first mock transaction's ID if none provided
    const targetId = mockTransactions[0].id
    router.push({
      pathname : '/transaction/[id]',
      params   : { id: targetId }
    } as any)
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Check size={32} color="white" />
      </View>

      {/* Success Message */}
      <View style={styles.messageContainer}>
        <ThemedText style={styles.title}>Success!</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your transaction is now awaiting network confirmation.
        </ThemedText>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleGoHome}
        >
          <ThemedText style={styles.primaryButtonText}>Go Home</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleViewDetails}
        >
          <ThemedText style={styles.secondaryButtonText}>Details</ThemedText>
        </TouchableOpacity>
      </View>
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
  iconContainer : {
    width           : 64,
    height          : 64,
    borderRadius    : 32,
    backgroundColor : '#22C55E', // Success green color
    alignItems      : 'center',
    justifyContent  : 'center',
    marginBottom    : 24,
  },
  messageContainer : {
    alignItems   : 'center',
    marginBottom : 48,
  },
  title : {
    fontSize     : 32,
    fontWeight   : '600',
    marginBottom : 12,
  },
  subtitle : {
    fontSize  : 16,
    color     : '#666',
    textAlign : 'center',
    maxWidth  : '80%',
  },
  buttonContainer : {
    width : '100%',
    gap   : 12,
  },
  primaryButton : {
    width           : '100%',
    height          : 56,
    backgroundColor : Colors.light.electricBlue,
    borderRadius    : 28,
    alignItems      : 'center',
    justifyContent  : 'center',
  },
  primaryButtonText : {
    color      : '#FFF',
    fontSize   : 16,
    fontWeight : '600',
  },
  secondaryButton : {
    width          : '100%',
    height         : 48,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  secondaryButtonText : {
    color      : Colors.light.electricBlue,
    fontSize   : 16,
    fontWeight : '600',
  },
}) 