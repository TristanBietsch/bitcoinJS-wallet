import React from 'react'
import { View, ViewStyle } from 'react-native'
import { PriceProvider } from '@/src/context/PriceContext'

interface AppProviderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Container component that provides global context providers
export function AppProvider(props: AppProviderProps): React.ReactElement {
  const { children, style } = props
  
  return (
    <View style={[ { flex: 1 }, style ]}>
      <PriceProvider>
        {children}
      </PriceProvider>
    </View>
  )
} 