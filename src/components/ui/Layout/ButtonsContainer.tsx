import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface ButtonsContainerProps {
  children: ReactNode
  style?: ViewStyle
  gap?: number
  paddingHorizontal?: number
  marginTop?: number
}

/**
 * A reusable container for buttons with consistent spacing and styling
 */
const ButtonsContainer: React.FC<ButtonsContainerProps> = ({
  children,
  style,
  gap = 16,
  paddingHorizontal = 20,
  marginTop = 40,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          gap,
          paddingHorizontal,
          marginTop,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width : '100%',
  },
})

export default ButtonsContainer 