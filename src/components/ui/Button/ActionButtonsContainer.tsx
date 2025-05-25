import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface ActionButtonsContainerProps {
  children: ReactNode
  style?: ViewStyle
  gap?: number
  horizontal?: boolean
}

/**
 * A container for action buttons with configurable layout
 */
const ActionButtonsContainer: React.FC<ActionButtonsContainerProps> = ({
  children,
  style,
  gap = 16,
  horizontal = true
}) => {
  return (
    <View 
      style={[
        styles.container, 
        horizontal ? styles.horizontal : styles.vertical,
        { gap },
        style
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width          : '100%',
    alignItems     : 'center',
    marginVertical : 12,
  },
  horizontal : {
    flexDirection  : 'row',
    justifyContent : 'center',
  },
  vertical : {
    flexDirection  : 'column',
    justifyContent : 'flex-start',
  }
})

export default ActionButtonsContainer 