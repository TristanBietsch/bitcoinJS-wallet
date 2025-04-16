import React from 'react'
import { View } from 'react-native'

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  )
} 