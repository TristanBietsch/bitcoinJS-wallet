import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  generateWallet, 
  importWallet, 
  validateMnemonic 
} from '../../services/bitcoin/wallet/bitcoinJsWallet'

// Constants for storage keys
const WALLET_MNEMONIC_KEY = 'bitcoin_wallet_mnemonic'
const WALLET_ADDRESS_KEY = 'bitcoin_wallet_address'

export const useBitcoinJSWallet = () => {
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)
  const [ address, setAddress ] = useState<string | null>(null)

  // Initialize wallet on app start - load from storage
  const initWallet = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check if we already have a wallet
      const storedAddress = await AsyncStorage.getItem(WALLET_ADDRESS_KEY)
      
      if (storedAddress) {
        setAddress(storedAddress)
      }
      
      return !!storedAddress
    } catch (error) {
      console.error('Error initializing wallet:', error)
      setError('Failed to initialize wallet')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new wallet
  const createNewWallet = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Generate a new wallet
      const { mnemonic, address: newAddress } = await generateWallet()
      
      // Store in storage
      await AsyncStorage.setItem(WALLET_MNEMONIC_KEY, mnemonic)
      await AsyncStorage.setItem(WALLET_ADDRESS_KEY, newAddress || '')
      
      setAddress(newAddress || null)
      
      return { mnemonic, address: newAddress }
    } catch (error) {
      console.error('Error creating wallet:', error)
      setError('Failed to create wallet')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Restore wallet from mnemonic
  const restoreWallet = useCallback(async (mnemonic: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validate mnemonic
      if (!validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase')
      }
      
      // Import wallet from mnemonic
      const { address: importedAddress } = await importWallet(mnemonic)
      
      // Store in storage
      await AsyncStorage.setItem(WALLET_MNEMONIC_KEY, mnemonic)
      await AsyncStorage.setItem(WALLET_ADDRESS_KEY, importedAddress || '')
      
      setAddress(importedAddress || null)
      
      return importedAddress
    } catch (error) {
      console.error('Error restoring wallet:', error)
      setError('Failed to restore wallet')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get current wallet address
  const getAddress = useCallback(async () => {
    try {
      // If we already have the address in state, return it
      if (address) return address
      
      // Otherwise get from storage
      const storedAddress = await AsyncStorage.getItem(WALLET_ADDRESS_KEY)
      
      if (storedAddress) {
        setAddress(storedAddress)
        return storedAddress
      }
      
      return null
    } catch (error) {
      console.error('Error getting address:', error)
      return null
    }
  }, [ address ])

  return {
    isLoading,
    error,
    address,
    initWallet,
    createNewWallet,
    restoreWallet,
    getAddress
  }
} 