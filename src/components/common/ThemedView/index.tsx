import React from 'react'
import { View, ViewProps } from 'react-native'

export function ThemedView(props: ViewProps) {
  const { style, ...otherProps } = props
  
  return (
    <View
      style={[
        { backgroundColor: '#fff' },
        style,
      ]}
      {...otherProps}
    />
  )
} 