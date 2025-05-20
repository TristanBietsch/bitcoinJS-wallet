import { useState, useCallback, useEffect, useRef } from 'react'
import { Alert, BackHandler } from 'react-native'
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
  const hasNavigatedRef = useRef(false)
  const router = useRouter()
  const { setAddress, setAmount } = useSendStore()
  
  // Define handleClose before the useEffect that uses it
  const handleClose = useCallback(() => {
    if (hasNavigatedRef.current) return
    
    hasNavigatedRef.current = true
    router.back()
  }, [ router ])
  
  // Reset scanning state when component mounts
  useEffect(() => {
    setIsScanning(true)
    hasNavigatedRef.current = false
    
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose()
      return true
    })
    
    // Clean up function will run when component unmounts
    return () => {
      setIsScanning(false)
      backHandler.remove()
    }
  }, [ handleClose ])

  // Process the scanned QR code data
  const handleQRCodeScanned = useCallback((data: string) => {
    // Prevent double-scanning and double-navigation
    if (!data || !isScanning || hasNavigatedRef.current) return
    
    setIsScanning(false) // Prevent multiple scans
    
    try {
      const { address, amount } = parseQRCode(data)
      
      // Validate the address
      const validationResult = validateAddress(address)
      
      if (!validationResult.isValid) {
        Alert.alert(
          'Invalid Address',
          'The scanned QR code does not contain a valid Bitcoin address.',
          [ { text: 'OK', onPress: () => setIsScanning(true) } ]
        )
        return
      }
      
      // Store the validated address and amount
      setAddress(address)
      if (amount) {
        setAmount(amount.toString())
      }
      
      // Mark that we've navigated to prevent double-navigation
      hasNavigatedRef.current = true
      
      // Navigate back to the /send/send screen by going back first (to clear camera) 
      // and then using replace to avoid stacking screens
      router.back()
      setTimeout(() => {
        router.replace('/send/send' as any)
      }, 100)
      
    } catch (_error) {
      Alert.alert(
        'Error',
        'Failed to parse QR code. Please try again.',
        [ { text: 'OK', onPress: () => setIsScanning(true) } ]
      )
    }
  }, [ isScanning, router, setAddress, setAmount ])
  
  // Handle camera permission errors
  const handleCameraError = useCallback(() => {
    if (hasNavigatedRef.current) return
    
    hasNavigatedRef.current = true
    Alert.alert(
      'Camera Error',
      'Failed to access camera. Please check your camera permissions.',
      [ { text: 'OK', onPress: () => router.back() } ]
    )
  }, [ router ])

  return {
    isScanning,
    handleQRCodeScanned,
    handleCameraError,
    handleClose
  }
} 