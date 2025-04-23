import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedView } from '@/src/components/ui/View'

interface OnboardingContainerProps {
  children: ReactNode
  style?: ViewStyle
  contentStyle?: ViewStyle
}

/**
 * A reusable container component for onboarding screens with consistent styling
 */
const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  style,
  contentStyle
}) => {
  return (
    <ThemedView style={[ styles.container, style ]}>
      <View style={[ styles.content, contentStyle ]}>
        {children}
      </View>
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
  content : {
    flex           : 1,
    alignItems     : 'center',
    justifyContent : 'center',
    width          : '100%',
  },
})

export default OnboardingContainer 