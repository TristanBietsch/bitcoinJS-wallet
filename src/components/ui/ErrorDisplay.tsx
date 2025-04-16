import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from './Text'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  retryText?: string
}

/**
 * A reusable component for displaying errors with an optional retry button
 */
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  retryText = 'Retry'
}: ErrorDisplayProps) => {
  return (
    <View style={styles.errorContainer}>
      <ThemedText style={styles.errorText}>{error}</ThemedText>
      
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <ThemedText style={styles.retryText}>{retryText}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  errorContainer : {
    alignItems   : 'center',
    marginBottom : 16,
  },
  errorText : {
    color        : 'red',
    marginBottom : 8,
  },
  retryButton : {
    backgroundColor   : '#f0f0f0',
    paddingVertical   : 6,
    paddingHorizontal : 12,
    borderRadius      : 4,
  },
  retryText : {
    color : 'black',
  },
})

export default ErrorDisplay 