import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { parseQRCode } from '@/src/utils/send/qrCodeParser'
import { useSendStore } from '@/src/store/sendStore'
import { useRouter } from 'expo-router'

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
      // Parse the QR code data
      const parsedData = parseQRCode(data)
      
      // Store the address in the send store
      setAddress(parsedData.address)
      
      // If we have an amount from the QR code, save that too
      if (parsedData.amount) {
        const amountString = parsedData.amount.toString()
        setAmount(amountString)
      }
      
      // Navigate back to the send screen
      router.back()
      
    } catch (_error) {
      Alert.alert(
        'Invalid QR Code',
        'The scanned QR code does not contain a valid Bitcoin address.',
        [ { text: 'Try Again', onPress: () => setIsScanning(true) } ]
      )
    }
  }, [ isScanning, router, setAddress, setAmount ])
  
  // Handle camera permission errors
  const handleCameraError = useCallback(() => {
    Alert.alert(
      'Camera Permission',
      'Please allow camera access to scan QR codes.',
      [ { text: 'OK', onPress: () => router.back() } ]
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