import React, { ReactNode } from 'react'
import { ViewStyle, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { Colors } from '@/src/constants/colors'

interface StatusScreenLayoutProps {
  children: ReactNode
  style?: ViewStyle
  backgroundColor?: string
  hideHeader?: boolean
}

/**
 * A layout component for status screens (loading, error, success)
 * with centered content and standard styling
 */
const StatusScreenLayout: React.FC<StatusScreenLayoutProps> = ({
  children,
  style,
  backgroundColor = Colors.light.background,
  hideHeader = true
}) => {
  return (
    <SafeAreaContainer 
      style={{ ...styles.container, ...style }}
      backgroundColor={backgroundColor}
    >
      <Stack.Screen options={{ headerShown: !hideHeader }} />
      {children}
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    paddingHorizontal : 20,
  }
})

export default StatusScreenLayout 