import { useState, useEffect } from 'react'
import { getNewAddress } from '@/src/services/bitcoin/address/addressService'

interface AddressGenerationResult {
  address: string
  isLoading: boolean
  error: Error | null
  regenerateAddress: () => Promise<void>
}

/**
 * Hook to handle Bitcoin address generation
 */
export const useAddressGeneration = (): AddressGenerationResult => {
  const [ address, setAddress ] = useState<string>('')
  const [ isLoading, setIsLoading ] = useState<boolean>(true)
  const [ error, setError ] = useState<Error | null>(null)
  
  const fetchAddress = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const addr = await getNewAddress()
      setAddress(addr)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate address'))
      console.error('Error generating Bitcoin address:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Generate address on initial load
  useEffect(() => {
    fetchAddress()
  }, [])
  
  return {
    address,
    isLoading,
    error,
    regenerateAddress : fetchAddress
  }
} 