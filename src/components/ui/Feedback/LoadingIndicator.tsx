import React from 'react'
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native'

interface LoadingIndicatorProps {
  size?: 'small' | 'large'
  color?: string
  style?: ViewStyle
}

/**
 * A reusable loading indicator component
 */
const LoadingIndicator = ({ 
  size = 'large', 
  color = 'red',
  style 
}: LoadingIndicatorProps) => {
  return (
    <View style={[ styles.container, style ]}>
      <ActivityIndicator 
        testID="activity-indicator" 
        size={size} 
        color={color} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    padding    : 10,
    alignItems : 'center',
  }
})

export default LoadingIndicator 