/**
 * Reusable screen layout component for consistent screen structure
 */
import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import LoadingIndicator from '@/src/components/ui/Feedback/LoadingIndicator'

interface ScreenLayoutProps {
  children: ReactNode
  isLoading?: boolean
  style?: ViewStyle
  contentStyle?: ViewStyle
}

/**
 * A reusable screen layout component for consistent screen structure
 */
const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  isLoading = false,
  style,
  contentStyle
}) => {
  if (isLoading) {
    return (
      <View style={[ styles.container, style ]}>
        <LoadingIndicator 
          size="large" 
          color="#00D782" 
        />
      </View>
    )
  }
  
  return (
    <View style={[ styles.container, style ]}>
      <View style={[ styles.content, contentStyle ]}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#FFFFFF',
    paddingBottom   : 100, // Add padding for bottom navigation
  },
  content : {
    flex : 1,
  }
})

export default ScreenLayout 