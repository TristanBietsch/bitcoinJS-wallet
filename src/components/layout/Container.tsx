import React, { ReactNode } from 'react'
// import { PriceProvider } from '@/src/context/PriceContext' // Removed
// import { ThemeProvider } from '@/src/context/ThemeContext' // Removed as file not found

interface AppProviderProps {
  children: ReactNode
}

/**
 * Central provider for essential app contexts like Theme, Navigation, etc.
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // return (
  //   <ThemeProvider>
  //     {children} 
  //   </ThemeProvider>
  // )
  return <>{children}</> // Simplified to return children directly
} 