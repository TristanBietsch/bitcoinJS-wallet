import { useState, useCallback } from 'react'
import { Clipboard, Platform, Alert } from 'react-native'
import { validateAddress } from '@/src/utils/validation/validateAddress'

export const useAddressValidation = () => {
  const [ address, setAddress ] = useState('')
  const [ addressError, setAddressError ] = useState<string | null>(null)
  const [ clipboardAddress, setClipboardAddress ] = useState<string | null>(null)

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
      const clipboardContent = await Clipboard.getString()
      if (clipboardContent && !address) {
        const result = validateAddress(clipboardContent)
        if (result.isValid) {
          setClipboardAddress(clipboardContent)
          showPasteAlert(clipboardContent)
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