import { useState, useCallback, useRef } from 'react'
import { Clipboard, Platform, Alert } from 'react-native'
import { validateAddress } from '@/src/utils/validation/validateAddress'

export const useAddressValidation = () => {
  const [ address, setAddress ] = useState('')
  const [ addressError, setAddressError ] = useState<string | null>(null)
  const [ clipboardAddress, setClipboardAddress ] = useState<string | null>(null)
  
  // Use a ref to track if we've shown the paste alert in this session
  const hasShownPasteAlertRef = useRef(false)

  const handleAddressChange = useCallback((text: string) => {
    setAddress(text)
    if (text) {
      const result = validateAddress(text)
      setAddressError(result.error)
    } else {
      setAddressError(null)
    }
  }, [])

  const checkClipboard = useCallback(async () => {
    try {
      // Only check clipboard if we have no address yet and haven't shown the alert
      if (!address && !hasShownPasteAlertRef.current) {
        const clipboardContent = await Clipboard.getString()
        if (clipboardContent) {
          const result = validateAddress(clipboardContent)
          if (result.isValid) {
            setClipboardAddress(clipboardContent)
            showPasteAlert(clipboardContent)
            // Mark that we've shown the alert
            hasShownPasteAlertRef.current = true
          }
        }
      }
    } catch (error) {
      console.error('Error checking clipboard:', error)
    }
  }, [ address ])

  const showPasteAlert = useCallback((detectedAddress: string) => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Paste Bitcoin Address?',
        'A valid Bitcoin address was found in your clipboard. Use it?',
        [
          {
            text    : 'Cancel',
            style   : 'cancel',
            onPress : () => setClipboardAddress(null)
          },
          {
            text    : 'Paste',
            style   : 'default',
            onPress : () => {
              setAddress(detectedAddress)
              setAddressError(null)
              setClipboardAddress(null)
            }
          }
        ],
        { cancelable: false }
      )
    }
  }, [])

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