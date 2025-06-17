import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { validateBitcoinAddress } from '@/src/services/bitcoin/addressValidationService'
import { getEnhancedFeeEstimates } from '@/src/services/bitcoin/feeEstimationService'

// Use the FeeOption type from sendStore
interface FeeOption {
  feeRate: number
  totalSats: number
  confirmationTime: number
}

interface UseSendAddressScreenReturn {
  // Address state
  address: string
  addressError: string | null
  isValidAddress: boolean
  
  // Fee state
  selectedSpeed: 'economy' | 'normal' | 'express' | 'custom'
  feeOptions: FeeOption[]
  customFeeRate: number
  isLoadingFees: boolean
  
  // Actions
  setAddress: (address: string) => void
  setSelectedSpeed: (speed: 'economy' | 'normal' | 'express' | 'custom') => void
  setCustomFeeRate: (rate: number) => void
  handleContinue: () => void
  loadFeeRates: () => Promise<void>
}

/**
 * Hook for managing the Send Address screen state and logic
 * Consolidated version that doesn't use other hooks
 */
export function useSendAddressScreen(): UseSendAddressScreenReturn {
  const router = useRouter()
  const sendStore = useSendStore()
  
  // Local state
  const [ addressError, setAddressError ] = useState<string | null>(null)
  const [ isLoadingFees, setIsLoadingFees ] = useState(false)
  
  // Get values from stores
  const address = sendStore.address || ''
  const selectedSpeed = (sendStore.speed || 'normal') as 'economy' | 'normal' | 'express' | 'custom'
  const customFeeRate = sendStore.customFee?.feeRate || 1
  const feeOptions = sendStore.feeOptions || []
  
  // Validate address
  const isValidAddress = (() => {
    if (!address) return false
    const validation = validateBitcoinAddress(address)
    return validation.isValid
  })()
  
  // Set address with validation
  const setAddress = useCallback((newAddress: string) => {
    sendStore.setAddress(newAddress)
    
    if (newAddress && newAddress.length > 0) {
      const validation = validateBitcoinAddress(newAddress)
      if (!validation.isValid) {
        setAddressError(validation.error || 'Invalid Bitcoin address')
      } else {
        setAddressError(null)
      }
    } else {
      setAddressError(null)
    }
  }, [])
  
  // Set selected speed
  const setSelectedSpeed = useCallback((speed: 'economy' | 'normal' | 'express' | 'custom') => {
    sendStore.setSpeed(speed)
    
    // If switching to a preset speed, update the selected fee option
    if (speed !== 'custom') {
      const option = feeOptions.find((opt: FeeOption) => {
        // Map speed names to fee rates
        if (speed === 'economy' && opt.confirmationTime >= 144) return true
        if (speed === 'normal' && opt.confirmationTime >= 6 && opt.confirmationTime < 144) return true
        if (speed === 'express' && opt.confirmationTime < 6) return true
        return false
      })
      if (option) {
        sendStore.setSelectedFeeOption(option)
      }
    }
  }, [ feeOptions ])
  
  // Set custom fee rate
  const setCustomFeeRate = useCallback((rate: number) => {
    if (rate > 0) {
      sendStore.setCustomFee({
        feeRate          : rate,
        totalSats        : 0, // Will be calculated based on transaction
        confirmationTime : 6  // Default estimate
      })
    }
  }, [])
  
  // Load fee rates
  const loadFeeRates = useCallback(async () => {
    setIsLoadingFees(true)
    try {
      console.log('🔄 [useSendAddressScreen] Fetching enhanced fee estimates...')
      const rates = await getEnhancedFeeEstimates()
      console.log('✅ [useSendAddressScreen] Received fee rates:', {
        economy : rates.economy,
        normal  : rates.normal, 
        fast    : rates.fast,
        source  : rates.source
      })
      
      // Convert to fee options format used by sendStore
      const options: FeeOption[] = [
        {
          feeRate          : rates.economy,
          totalSats        : 0, // Will be calculated based on transaction
          confirmationTime : rates.confirmationTargets.economy
        },
        {
          feeRate          : rates.normal,
          totalSats        : 0,
          confirmationTime : rates.confirmationTargets.normal
        },
        {
          feeRate          : rates.fast,
          totalSats        : 0,
          confirmationTime : rates.confirmationTargets.fast
        }
      ]
      
      sendStore.setFeeOptions(options)
      sendStore.setFeeRates({
        economy   : rates.economy,
        normal    : rates.normal,
        fast      : rates.fast,
        timestamp : rates.lastUpdated
      })
      
      // If a speed is selected, update the fee option
      if (selectedSpeed !== 'custom') {
        const option = options.find((opt: FeeOption) => {
          if (selectedSpeed === 'economy' && opt.confirmationTime >= 144) return true
          if (selectedSpeed === 'normal' && opt.confirmationTime >= 6 && opt.confirmationTime < 144) return true
          if (selectedSpeed === 'express' && opt.confirmationTime < 6) return true
          return false
        })
        if (option) {
          sendStore.setSelectedFeeOption(option)
        }
      }
    } catch (error) {
      console.error('Failed to load fee rates:', error)
    } finally {
      setIsLoadingFees(false)
    }
  }, [ selectedSpeed ])
  
  // Handle continue
  const handleContinue = useCallback(() => {
    if (!isValidAddress) {
      setAddressError('Please enter a valid Bitcoin address')
      return
    }
    
    // Ensure we have a fee rate set
    if (selectedSpeed === 'custom' && customFeeRate <= 0) {
      return
    }
    
    // Navigate to amount screen
    router.push('/send/amount' as any)
  }, [ isValidAddress, selectedSpeed, customFeeRate, router ])
  
  // Load fee rates on mount
  useEffect(() => {
    loadFeeRates()
  }, [])
  
  return {
    // Address state
    address,
    addressError,
    isValidAddress,
    
    // Fee state
    selectedSpeed,
    feeOptions,
    customFeeRate,
    isLoadingFees,
    
    // Actions
    setAddress,
    setSelectedSpeed,
    setCustomFeeRate,
    handleContinue,
    loadFeeRates
  }
} 