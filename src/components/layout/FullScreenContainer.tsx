import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface FullScreenContainerProps {
  children: ReactNode
  style?: ViewStyle
  backgroundColor?: string
}

/**
 * A specialized container for full-screen camera/scanner views
 * that respects safe areas and maintains proper styling
 */
const FullScreenContainer: React.FC<FullScreenContainerProps> = ({
  children,
  style,
  backgroundColor = '#000000'
}) => {
  const insets = useSafeAreaInsets()
  
  return (
    <View 
      style={[
        styles.container,
        { 
          backgroundColor,
          paddingTop    : insets.top,
          paddingBottom : insets.bottom
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

export default FullScreenContainer 