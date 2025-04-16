import React from 'react'
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface LoadingStateProps {
  message?: string
  subText?: string
  indicatorColor?: string
  style?: ViewStyle
}

/**
 * A reusable loading state component with activity indicator and text
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing your transaction...',
  subText = 'This may take a few moments',
  indicatorColor = Colors.light.electricBlue,
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      <ActivityIndicator size="large" color={indicatorColor} />
      <ThemedText style={styles.loadingText}>
        {message}
      </ThemedText>
      {subText && (
        <ThemedText style={styles.subText}>
          {subText}
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
})

export default LoadingState 