import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ScreenFooterProps {
  children: ReactNode
  style?: ViewStyle
  withBorder?: boolean
  backgroundColor?: string
  borderColor?: string
}

/**
 * A reusable footer component for screen layouts
 */
const ScreenFooter: React.FC<ScreenFooterProps> = ({
  children,
  style,
  withBorder = true,
  backgroundColor = '#FFFFFF',
  borderColor = '#F0F0F0'
}) => {
  const insets = useSafeAreaInsets()
  
  return (
    <View 
      style={[
        styles.footer,
        {
          backgroundColor,
          paddingBottom  : Math.max(insets.bottom, 20),
          borderTopWidth : withBorder ? 1 : 0,
          borderTopColor : withBorder ? borderColor : 'transparent'
        },
        style
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  footer : {
    padding : 20,
  }
})

export default ScreenFooter 