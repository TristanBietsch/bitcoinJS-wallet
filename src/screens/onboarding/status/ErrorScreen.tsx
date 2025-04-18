import React from 'react'
import { StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ThemedText } from '@/src/components/ui/Text'
import { ThemedView } from '@/src/components/ui/View'
import { Colors } from '@/src/constants/colors'

interface ErrorScreenProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorScreen({ 
  onRetry, 
  message = "Something went wrong. Please try again."
}: ErrorScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Error
      </ThemedText>
      <ThemedText type="default" style={styles.message}>
        {message}
      </ThemedText>

      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Try Again
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex           : 1,
    padding        : 20,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    marginBottom : 10,
    textAlign    : 'center',
    color        : Colors.light.buttons.danger,
  },
  message : {
    textAlign    : 'center',
    marginBottom : 40,
    opacity      : 0.7,
  },
  button : {
    backgroundColor : Colors.light.buttons.primary,
    padding         : 16,
    borderRadius    : 12,
    alignItems      : 'center',
    width           : '100%',
  },
  buttonText : {
    color    : Colors.light.buttons.text,
    fontSize : 16,
  },
}) 