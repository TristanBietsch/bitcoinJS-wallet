import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SafeAreaContainerProps {
  children: ReactNode
  style?: ViewStyle
  backgroundColor?: string
}

/**
 * A container component that automatically adds padding for safe areas
 */
const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  style,
  backgroundColor = '#FFFFFF'
}) => {
  const insets = useSafeAreaInsets()
  
  return (
    <View 
      style={[
        styles.container,
        {
          paddingTop    : insets.top,
          paddingBottom : insets.bottom,
          backgroundColor
        },
        style
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  }
})

export default SafeAreaContainer 