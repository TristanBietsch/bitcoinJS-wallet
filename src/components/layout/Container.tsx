import React from 'react'
import { View, ViewStyle } from 'react-native'

interface AppProviderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Only export the named function, avoid default export
export function AppProvider(props: AppProviderProps): React.ReactElement {
  const { children, style } = props
  
  return (
    <View style={[ { flex: 1 }, style ]}>
      {children}
    </View>
  )
} 