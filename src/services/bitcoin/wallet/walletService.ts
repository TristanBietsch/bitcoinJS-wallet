import { mmkvStorage } from '@/src/services/storage/mmkvStorage'
import { apiClient } from '@/src/services/api/apiClient'
import { API_ENDPOINTS } from '@/src/services/api/apiEndpoints'
import { z } from 'zod'
import { useHaptics } from '@/src/hooks/useHaptics'

// Define wallet schema with zod
const walletSchema = z.object({
  id          : z.string(),
  name        : z.string(),
  balance     : z.number(),
  currency    : z.string(),
  createdAt   : z.string().datetime(),
  lastUpdated : z.string().datetime().optional(),
})

export type Wallet = z.infer<typeof walletSchema>;

const WALLET_STORAGE_KEY = 'wallet_data'

/**
 * Service for wallet management with local persistence and API integration
 */
export const walletService = {
  /**
   * Create a new wallet locally and on the server
   */
  createWallet : async (name: string): Promise<Wallet | null> => {
    try {
      // Create wallet on server
      const response = await apiClient.post(API_ENDPOINTS.WALLETS, { name })
      const newWallet: Wallet = {
        id        : response.data.id,
        name,
        balance   : 0,
        currency  : 'BTC',
        createdAt : new Date().toISOString(),
      }
      
      // Save wallet locally
      await mmkvStorage.set(WALLET_STORAGE_KEY, newWallet, walletSchema)
      
      return newWallet
    } catch (error) {
      console.error('Failed to create wallet:', error)
      return null
    }
  },
  
  /**
   * Get wallet data from local storage
   */
  getWallet : async (): Promise<Wallet | null> => {
    return mmkvStorage.get<Wallet>(WALLET_STORAGE_KEY, walletSchema)
  },
  
  /**
   * Get wallet balance from API and update local storage
   */
  getWalletBalance : async (): Promise<number | null> => {
    try {
      const wallet = await mmkvStorage.get<Wallet>(WALLET_STORAGE_KEY, walletSchema)
      if (!wallet) return null
      
      const response = await apiClient.get(API_ENDPOINTS.WALLET_BALANCE)
      const balance = response.data.balance
      
      // Update local wallet data
      const updatedWallet: Wallet = {
        ...wallet,
        balance,
        lastUpdated : new Date().toISOString()
      }
      
      await mmkvStorage.set(WALLET_STORAGE_KEY, updatedWallet, walletSchema)
      
      return balance
    } catch (error) {
      console.error('Failed to get wallet balance:', error)
      return null
    }
  },
  
  /**
   * Update wallet name
   */
  updateWalletName : async (name: string): Promise<boolean> => {
    try {
      const wallet = await mmkvStorage.get<Wallet>(WALLET_STORAGE_KEY, walletSchema)
      if (!wallet) return false
      
      await apiClient.put(`${API_ENDPOINTS.WALLETS}/${wallet.id}`, { name })
      
      const updatedWallet: Wallet = {
        ...wallet,
        name,
        lastUpdated : new Date().toISOString()
      }
      
      await mmkvStorage.set(WALLET_STORAGE_KEY, updatedWallet, walletSchema)
      
      return true
    } catch (error) {
      console.error('Failed to update wallet name:', error)
      return false
    }
  },
  
  /**
   * Delete wallet (with confirmation)
   */
  deleteWallet : async (): Promise<boolean> => {
    try {
      const wallet = await mmkvStorage.get<Wallet>(WALLET_STORAGE_KEY, walletSchema)
      if (!wallet) return false
      
      await apiClient.delete(`${API_ENDPOINTS.WALLETS}/${wallet.id}`)
      
      await mmkvStorage.delete(WALLET_STORAGE_KEY)
      
      // Trigger haptic feedback for important action
      const { triggerNotification } = useHaptics()
      triggerNotification('warning')
      
      return true
    } catch (error) {
      console.error('Failed to delete wallet:', error)
      return false
    }
  }
} 