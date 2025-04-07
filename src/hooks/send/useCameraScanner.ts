import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { parseQRCode } from '@/src/utils/send/qrCodeParser'
import { useSendStore } from '@/src/store/sendStore'
import { useRouter } from 'expo-router'
import { validateAddress } from '@/src/utils/validation'

export interface CameraScannerResult {
  address : string
  amount? : number
  label? : string
  message? : string
}

export const useCameraScanner = () => {
  const [ isScanning, setIsScanning ] = useState(true)
  const router = useRouter()
  const { setAddress, setAmount } = useSendStore()

  // Process the scanned QR code data
  const handleQRCodeScanned = useCallback((data: string) => {
    if (!data || !isScanning) return
    
    setIsScanning(false) // Prevent multiple scans
    
    try {
      const { address, amount } = parseQRCode(data)
      
      // Validate the address
      const validationResult = validateAddress(address)
      
      if (!validationResult.isValid) {
        Alert.alert(
          'Invalid Address',
          'The scanned QR code does not contain a valid Bitcoin address.',
          [ { text: 'OK' } ]
        )
        return
      }
      
      // Store the validated address and amount
      setAddress(address)
      if (amount) {
        setAmount(amount.toString())
      }
      
      // Navigate back to the send screen
      router.back()
      
    } catch (_error) {
      Alert.alert(
        'Error',
        'Failed to parse QR code. Please try again.',
        [ { text: 'OK' } ]
      )
    }
  }, [ isScanning, router, setAddress, setAmount ])
  
  // Handle camera permission errors
  const handleCameraError = useCallback(() => {
    Alert.alert(
      'Camera Error',
      'Failed to access camera. Please check your camera permissions.',
      [ { text: 'OK' } ]
    )
  }, [ router ])
  
  // Close the scanner and go back
  const handleClose = useCallback(() => {
    router.back()
  }, [ router ])

  return {
    isScanning,
    handleQRCodeScanned,
    handleCameraError,
    handleClose
  }
} 