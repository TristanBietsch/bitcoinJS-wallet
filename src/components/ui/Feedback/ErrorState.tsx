import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface ErrorStateProps {
  message: string
  retryText?: string
  onRetry?: () => void
  style?: ViewStyle
}

/**
 * A reusable error state component with message and retry option
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  retryText = 'Go back and try again',
  onRetry,
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      <ThemedText style={styles.errorText}>{message}</ThemedText>
      {onRetry && (
        <ThemedText 
          style={styles.retryText}
          onPress={onRetry}
        >
          {retryText}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems     : 'center',
    justifyContent : 'center',
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

export default ErrorState 