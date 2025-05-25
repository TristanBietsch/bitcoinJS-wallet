import { useState, useCallback, useRef } from 'react'
import { validateAndSanitizeAddress } from '@/src/utils/validation/validateAddress'
import { checkClipboardForAddress, showPasteAddressAlert } from '@/src/utils/validation/clipboardValidation'
import { bitcoinjsNetwork } from '@/src/config/env'

export const useAddressValidation = () => {
  const [ address, setAddress ] = useState('')
  const [ addressError, setAddressError ] = useState<string | null>(null)
  const [ clipboardAddress, setClipboardAddress ] = useState<string | null>(null)
  
  // Use a ref to track if we've shown the paste alert in this session
  const hasShownPasteAlertRef = useRef(false)

  const handleAddressChange = useCallback((text: string) => {
    setAddress(text)
    if (text) {
      const result = validateAndSanitizeAddress(text, bitcoinjsNetwork)
      
      // In dev mode, provide additional context about network support
      if (!result.isValid && result.error && __DEV__) {
        if (result.error.includes('but app is configured for')) {
          setAddressError(`${result.error} (Dev mode: both mainnet and testnet addresses are supported)`)
        } else {
          setAddressError(result.error)
        }
      } else {
        setAddressError(result.error || null)
      }
    } else {
      setAddressError(null)
    }
  }, [])

  const checkClipboard = useCallback(async () => {
    // Only check clipboard if we have no address yet and haven't shown the alert
    if (!address && !hasShownPasteAlertRef.current) {
      await checkClipboardForAddress(
        // Valid address found
        (detectedAddress) => {
          setClipboardAddress(detectedAddress)
          showPasteAddressAlert(
            detectedAddress,
            // On paste
            () => {
              setAddress(detectedAddress)
              setAddressError(null)
              setClipboardAddress(null)
            },
            // On cancel
            () => setClipboardAddress(null)
          )
          // Mark that we've shown the alert
          hasShownPasteAlertRef.current = true
        },
        // No valid address
        undefined,
        // Error
        (error) => console.error('Error checking clipboard:', error)
      )
    }
  }, [ address ])

  const resetAddress = useCallback(() => {
    setAddress('')
    setAddressError(null)
    setClipboardAddress(null)
    // Reset the alert flag when we reset the address
    hasShownPasteAlertRef.current = false
  }, [])

  return {
    address,
    addressError,
    clipboardAddress,
    handleAddressChange,
    checkClipboard,
    resetAddress
  }
} 