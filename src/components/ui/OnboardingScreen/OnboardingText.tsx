import React from 'react'
import { StyleSheet, TextStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface OnboardingTitleProps {
  children: React.ReactNode
  style?: TextStyle
}

interface OnboardingDescriptionProps {
  children: React.ReactNode
  style?: TextStyle
}

/**
 * A reusable title component for onboarding screens
 */
export const OnboardingTitle: React.FC<OnboardingTitleProps> = ({
  children,
  style
}) => {
  return (
    <ThemedText type="title" style={[ styles.title, style ]}>
      {children}
    </ThemedText>
  )
}

/**
 * A reusable description component for onboarding screens
 */
export const OnboardingDescription: React.FC<OnboardingDescriptionProps> = ({
  children,
  style
}) => {
  return (
    <ThemedText type="default" style={[ styles.description, style ]}>
      {children}
    </ThemedText>
  )
}

const styles = StyleSheet.create({
  title : {
    fontSize     : 32,
    fontWeight   : 'bold',
    marginBottom : 16,
    textAlign    : 'center',
  },
  description : {
    fontSize          : 16,
    textAlign         : 'center',
    paddingHorizontal : 40,
    opacity           : 0.7,
  },
}) 