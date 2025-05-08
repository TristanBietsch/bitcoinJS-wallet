import React, { createContext, useContext, ReactNode } from 'react'
import { useBitcoinPrice } from '@/src/hooks/bitcoin/useBitcoinPrice'

// Price context type definition - matches the hook return type
interface PriceContextType {
  btcPrice : number | null
  isLoading : boolean
  error : string | null
  refreshPrice : () => Promise<void>
}

// Default context values
const defaultPriceContext: PriceContextType = {
  btcPrice     : null,
  isLoading    : false,
  error        : null,
  refreshPrice : async () => {}
}

// Create context
const PriceContext = createContext<PriceContextType>(defaultPriceContext)

// Provider props
interface PriceProviderProps {
  children: ReactNode
  refreshInterval?: number
}

/**
 * Provider component that shares Bitcoin price data across the app
 */
export const PriceProvider: React.FC<PriceProviderProps> = ({ 
  children, 
  refreshInterval = 30000
}) => {
  // Use the Bitcoin price hook internally
  const priceData = useBitcoinPrice(refreshInterval)
  
  return (
    <PriceContext.Provider value={priceData}>
      {children}
    </PriceContext.Provider>
  )
}

/**
 * Custom hook to use the price context
 */
export const useGlobalBitcoinPrice = (): PriceContextType => {
  const context = useContext(PriceContext)
  if (!context) {
    throw new Error('useGlobalBitcoinPrice must be used within a PriceProvider')
  }
  return context
} 