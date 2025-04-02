import React from 'react'
import { GluestackUIProvider as BaseGluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '@/gluestack.config'

interface GluestackUIProviderProps {
  children: React.ReactNode;
}

export function GluestackUIProvider({ 
  children
}: GluestackUIProviderProps) {
  return (
    <BaseGluestackUIProvider config={config}>
      {children}
    </BaseGluestackUIProvider>
  )
}

export default GluestackUIProvider 