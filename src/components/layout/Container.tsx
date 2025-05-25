import React, { ReactNode } from 'react'
import { View } from 'react-native'

interface AppProviderProps {
  children: ReactNode
}

/**
 * Central provider for essential app contexts like Theme, Navigation, etc.
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <View style={{ flex: 1 }}>
      {/* 
        Removed WalletProvider and PriceProvider as they are replaced by Zustand stores.
        ThemeProvider might be added back if theme switching is implemented.
      */}
      {children}
    </View>
  )
} 