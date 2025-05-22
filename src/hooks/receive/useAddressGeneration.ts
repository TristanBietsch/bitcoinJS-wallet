import { useState, useEffect } from 'react'
// import { getNewAddress } from '@/src/services/bitcoin/address/addressService' // Old RPC call
import { deriveAddresses } from '@/src/services/bitcoin/wallet/addressDerivationService'
import { BITCOIN_NETWORK } from '@/src/config/bitcoinNetwork'
import * as bitcoin from 'bitcoinjs-lib' // For network objects

// Placeholder functions - these need to be implemented properly
// to securely fetch mnemonic and manage address indices.
const getMnemonicFromSecureStore = async (): Promise<string> => {
  // In a real app, this would fetch the mnemonic from secure storage
  console.warn('TODO: Implement secure mnemonic retrieval')
  // For now, returning a TEST mnemonic. DO NOT USE IN PRODUCTION.
  return 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
}

const getNextAddressIndex = async (): Promise<number> => {
  // In a real app, this would get the next unused address index,
  // possibly from app state or storage, and increment it.
  console.warn('TODO: Implement proper address index management')
  // For now, returning a fixed index for testing.
  return 0
}

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
      
      // Get mnemonic (securely!)
      const mnemonic = await getMnemonicFromSecureStore()
      if (!mnemonic) {
        throw new Error('Mnemonic not found. Wallet may not be initialized.')
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
      
      // Get the next address index to derive
      const nextIndex = await getNextAddressIndex()
      
      // Derive one new native segwit address
      const derivedAddresses = deriveAddresses(
        mnemonic,
        network,
        'native_segwit', // Or choose another type like 'segwit' or 'legacy'
        nextIndex,
        1 // Derive one address
      )
      
      if (derivedAddresses && derivedAddresses.length > 0) {
        setAddress(derivedAddresses[0].address)
      } else {
        throw new Error('Failed to derive address. No addresses returned.')
      }
      
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