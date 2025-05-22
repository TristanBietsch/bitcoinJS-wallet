import { useState, useEffect } from 'react'
// import { getNewAddress } from '@/src/services/bitcoin/address/addressService' // Old RPC call
import { deriveAddresses } from '@/src/services/bitcoin/wallet/addressDerivationService'
import { BITCOIN_NETWORK } from '@/src/config/bitcoinNetwork'
import * as bitcoin from 'bitcoinjs-lib' // For network objects
import { retrieveMnemonic } from '@/src/services/wallet/secureStorageService' // Import new service
import {
  getNextReceiveAddressIndex,
  storeNextReceiveAddressIndex,
} from '@/src/services/wallet/addressStateService' // Import new service functions

interface AddressGenerationResult {
  address: string
  isLoading: boolean
  error: Error | null
  regenerateAddress: () => Promise<void> // Allows re-triggering fetchAddress
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
      
      const mnemonic = await retrieveMnemonic() // Use the new service function
      if (!mnemonic) {
        // It's crucial to handle this case in the UI.
        // For example, prompt the user to create or import a wallet.
        setError(new Error('Wallet not set up. Mnemonic not found.'))
        setIsLoading(false)
        return
      }
      
      // Determine bitcoinjs-lib network object
      let network: bitcoin.networks.Network
      if (BITCOIN_NETWORK === 'mainnet') {
        network = bitcoin.networks.bitcoin
      } else if (BITCOIN_NETWORK === 'testnet') {
        network = bitcoin.networks.testnet
      } else {
        network = bitcoin.networks.regtest
      }
      
      // Get the current index to use for derivation
      const currentIndex = await getNextReceiveAddressIndex()
      
      // Derive one new native segwit address
      const derivedAddresses = deriveAddresses(
        mnemonic,
        network,
        'native_segwit', // Or choose another type like 'segwit' or 'legacy'
        currentIndex, // Use the retrieved current index
        1 // Derive one address
      )
      
      if (derivedAddresses && derivedAddresses.length > 0) {
        const newAddress = derivedAddresses[0].address
        setAddress(newAddress)
        // Successfully derived and set an address, now store the *next* index
        await storeNextReceiveAddressIndex(currentIndex + 1)
      } else {
        throw new Error('Failed to derive address. No addresses returned.')
      }
      
    } catch (err) {
      let errorMessage = 'Failed to generate address'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      setError(new Error(errorMessage))
      console.error('Error generating Bitcoin address:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Generate address on initial load
  useEffect(() => {
    fetchAddress()
    // Note: If fetchAddress could be called multiple times by other means (e.g. regenerateAddress),
    // and you want to avoid multiple calls on mount if regenerateAddress changes identity,
    // you might pass an empty dependency array or a more stable reference if needed.
    // For now, assuming fetchAddress is stable or only intended to run on mount / explicit regeneration.
  }, []) // Empty dependency array ensures it runs once on mount
  
  return {
    address,
    isLoading,
    error,
    regenerateAddress : fetchAddress
  }
} 