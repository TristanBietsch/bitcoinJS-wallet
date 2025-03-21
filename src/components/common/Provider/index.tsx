import React from 'react'
import { GluestackUIProvider as BaseGluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '@/gluestack.config'

interface GluestackUIProviderProps {
  children: React.ReactNode;
  mode?: 'light' | 'dark';
}

export function GluestackUIProvider({ 
  children, 
  mode = 'light' 
}: GluestackUIProviderProps) {
  return (
    <BaseGluestackUIProvider config={config} mode={mode}>
      {children}
    </BaseGluestackUIProvider>
  )
}

export default GluestackUIProvider 