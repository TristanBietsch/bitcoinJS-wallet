import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { Stack } from 'expo-router'
import { X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/src/constants/colors'
import { CameraView, useCameraPermissions } from 'expo-camera'
import QRCode from 'react-native-qrcode-svg'
import { ThemedText } from '@/src/components/ui/Text'
import { useSendStore } from '@/src/store/sendStore'
import { useWalletAddress } from '@/src/store/walletStore'


// Constants for QR frame layout
const SCREEN_WIDTH = Dimensions.get('window').width
const FRAME_WIDTH = SCREEN_WIDTH * 0.7
const FRAME_HEIGHT = FRAME_WIDTH
const FRAME_BORDER_WIDTH = 3
const FRAME_CORNER_SIZE = 20

// Bitcoin address validation regex patterns
const BTC_ADDRESS_REGEX = {
  P2PKH  : /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // Legacy addresses starting with 1
  P2SH   : /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,    // Legacy addresses starting with 3
  BECH32 : /^bc1[a-zA-HJ-NP-Z0-9]{25,90}$/      // Segwit addresses starting with bc1
}

// BIP21 URI regex - updated to better handle various formats
const BIP21_REGEX = /^(?:bitcoin:)?(([13]|bc1)[a-zA-HJ-NP-Z0-9]{25,90})(?:\?(.*))?$/

// Function to validate Bitcoin address
const isValidBitcoinAddress = (address: string): boolean => {
  return (
    BTC_ADDRESS_REGEX.P2PKH.test(address) ||
    BTC_ADDRESS_REGEX.P2SH.test(address) ||
    BTC_ADDRESS_REGEX.BECH32.test(address)
  )
}

// Function to parse BIP21 URI
const parseBIP21 = (uri: string): { address: string; amount?: string; label?: string; message?: string } | null => {
  try {
    console.log('Attempting to parse BIP21:', uri)
    
    // Handle URLs with or without the bitcoin: prefix
    let processedUri = uri
    if (!uri.startsWith('bitcoin:')) {
      // Try to detect if this is a valid address directly
      if (isValidBitcoinAddress(uri)) {
        console.log('Valid Bitcoin address detected without prefix')
        return { address: uri }
      }
    }
    
    const match = processedUri.match(BIP21_REGEX)
    if (!match) {
      console.log('No BIP21 match found')
      return null
    }

    const address = match[1]
    console.log('Extracted address:', address)
    
    const queryParams = match[3]
    console.log('Query params:', queryParams)
    
    // Check if the extracted address is valid
    if (!isValidBitcoinAddress(address)) {
      console.log('Address validation failed')
      return null
    }
    
    // Parse query parameters if they exist
    const result: { address: string; amount?: string; label?: string; message?: string } = { address }
    
    if (queryParams) {
      // Handle URL-encoded params correctly
      // Replace semicolons with ampersands if needed
      const normalizedParams = queryParams.replace(';', '&')
      const params = new URLSearchParams(normalizedParams)
      
      // Get the amount parameter safely
      const amountStr = params.get('amount')
      if (amountStr) {
        // Ensure amount is a valid number
        const amount = parseFloat(amountStr)
        if (!isNaN(amount)) {
          result.amount = amount.toString()
          console.log('Found amount:', result.amount)
        }
      }
      
      // Get other parameters
      const label = params.get('label')
      if (label) {
        result.label = label
        console.log('Found label:', label)
      }
      
      const message = params.get('message')
      if (message) {
        result.message = message
        console.log('Found message:', message)
      }
    }
    
    console.log('Parsed BIP21 result:', result)
    return result
  } catch (error) {
    console.error('Error parsing BIP21 URI:', error)
    return null
  }
}

// Types for the ModeToggle component
interface ModeToggleProps {
  activeMode: 'scan' | 'qrcode';
  onModeChange: (mode: 'scan' | 'qrcode') => void;
}

// Component to display the toggle buttons between Scan and QR Code modes
const ModeToggle: React.FC<ModeToggleProps> = ({ activeMode, onModeChange }) => {
  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity 
        style={[
          styles.toggleButton, 
          styles.toggleButtonLeft,
          activeMode === 'scan' && styles.activeToggleButton
        ]}
        onPress={() => onModeChange('scan')}
      >
        <ThemedText style={[
          styles.toggleButtonText,
          activeMode === 'scan' && styles.activeToggleButtonText
        ]}>
          Scan
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.toggleButton, 
          styles.toggleButtonRight,
          activeMode === 'qrcode' && styles.activeToggleButton
        ]}
        onPress={() => onModeChange('qrcode')}
      >
        <ThemedText style={[
          styles.toggleButtonText,
          activeMode === 'qrcode' && styles.activeToggleButtonText
        ]}>
          QR Code
        </ThemedText>
      </TouchableOpacity>
    </View>
  )
}

// Types for the ScannerMode component
interface ScannerModeProps {
  onScanSuccess: (data: string) => void;
}

// Scanner Mode Component with camera access
const ScannerMode: React.FC<ScannerModeProps> = ({ onScanSuccess }) => {
  const [ permission, requestPermission ] = useCameraPermissions()
  const [ scanned, setScanned ] = useState(false)

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
  }, [ permission, requestPermission ])

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (data && !scanned) {
      setScanned(true)
      setTimeout(() => {
        onScanSuccess(data)
      }, 300) // Add a small delay to prevent multiple triggering
    }
  }

  // Render QR code frame corners
  const renderFrameCorners = () => {
    return (
      <View style={styles.frameContainer}>
        {/* Top left corner */}
        <View style={[ styles.corner, styles.topLeft ]}>
          <View style={[ styles.cornerBorder, styles.cornerBorderTop ]} />
          <View style={[ styles.cornerBorder, styles.cornerBorderLeft ]} />
        </View>
        
        {/* Top right corner */}
        <View style={[ styles.corner, styles.topRight ]}>
          <View style={[ styles.cornerBorder, styles.cornerBorderTop ]} />
          <View style={[ styles.cornerBorder, styles.cornerBorderRight ]} />
        </View>
        
        {/* Bottom left corner */}
        <View style={[ styles.corner, styles.bottomLeft ]}>
          <View style={[ styles.cornerBorder, styles.cornerBorderBottom ]} />
          <View style={[ styles.cornerBorder, styles.cornerBorderLeft ]} />
        </View>
        
        {/* Bottom right corner */}
        <View style={[ styles.corner, styles.bottomRight ]}>
          <View style={[ styles.cornerBorder, styles.cornerBorderBottom ]} />
          <View style={[ styles.cornerBorder, styles.cornerBorderRight ]} />
        </View>
      </View>
    )
  }

  // Render camera based on permission status
  const renderCamera = () => {
    if (!permission) {
      return (
        <View style={styles.cameraError}>
          <ThemedText style={styles.errorText}>
            Requesting camera permission...
          </ThemedText>
        </View>
      )
    }

    if (!permission.granted) {
      return (
        <View style={styles.cameraError}>
          <ThemedText style={styles.errorText}>
            Camera permission denied. Please enable camera access in your device settings.
          </ThemedText>
        </View>
      )
    }

    try {
      return (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes : [ 'qr' ]
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      )
    } catch (error) {
      console.error('Camera initialization error:', error)
      return (
        <View style={styles.cameraError}>
          <ThemedText style={styles.errorText}>
            Camera not available. Please check permissions.
          </ThemedText>
        </View>
      )
    }
  }

  return (
    <View style={styles.scannerContainer}>
      {renderCamera()}
      {renderFrameCorners()}
      
      <View style={styles.scannerInfoContainer}>
        <ThemedText style={styles.scannerText}>
          {scanned ? 'QR Code Scanned!' : 'Align QR code within frame'}
        </ThemedText>
      </View>
    </View>
  )
}

// QR Code Display Mode Component
const QRCodeMode: React.FC = () => {
  const walletAddress = useWalletAddress()
  
  // Show loading state if wallet address is not available yet
  if (!walletAddress) {
    return (
      <View style={styles.qrCodeContainer}>
        <View style={styles.qrCodeWrapper}>
          <View style={styles.loadingPlaceholder}>
            <ThemedText style={styles.loadingText}>
              Loading wallet address...
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.addressContainer}>
          <ThemedText style={styles.addressLabel}>
            on-chain address:
          </ThemedText>
          <View style={styles.addressTouchable}>
            <ThemedText style={styles.addressText}>
              Wallet not loaded
            </ThemedText>
          </View>
        </View>
      </View>
    )
  }
  
  return (
    <View style={styles.qrCodeContainer}>
      <View style={styles.qrCodeWrapper}>
        <QRCode
          value={walletAddress}
          size={FRAME_WIDTH}
          color="black"
          backgroundColor="white"
        />
      </View>
      
      <View style={styles.addressContainer}>
        <ThemedText style={styles.addressLabel}>
          on-chain address:
        </ThemedText>
        <TouchableOpacity 
          onPress={async () => {
            await Clipboard.setStringAsync(walletAddress)
            Alert.alert('Copied!', 'Address copied to clipboard')
          }}
          style={styles.addressTouchable}
        >
          <ThemedText style={styles.addressText}>
            {walletAddress}
          </ThemedText>
          <ThemedText style={styles.copyHint}>
            Tap to copy
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Main QR Menu Screen Component
const QRMenuScreen: React.FC = () => {
  const [ mode, setMode ] = useState<'scan' | 'qrcode'>('scan')
  const [ isProcessing, setIsProcessing ] = useState(false)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { setAddress, setAmount, reset } = useSendStore()
  

  
  const handleClose = () => {
    router.back()
  }
  
  const navigateToSendAddress = (address: string) => {
    console.log('Navigating to send address with:', address)
    // Reset first, then set just the address
    reset()
    setAddress(address)
    
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      try {
        router.replace('/send/address' as any)
      } catch (err) {
        console.error('Navigation error:', err)
        setIsProcessing(false)
        Alert.alert(
          "Navigation Error",
          "Could not navigate to the send screen. Please try again.",
          [ { text: "OK" } ]
        )
      }
    }, 100)
  }
  
  const navigateToSendConfirm = (address: string, amount?: string) => {
    console.log('Navigating to confirm with:', { address, amount })
    // Reset first to clear any previous state
    reset()
    setAddress(address)
    if (amount) {
      setAmount(amount)
    }
    
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      try {
        router.replace('/send/confirm' as any)
      } catch (err) {
        console.error('Navigation error:', err)
        setIsProcessing(false)
        Alert.alert(
          "Navigation Error",
          "Could not navigate to the confirm screen. Please try again.",
          [ { text: "OK" } ]
        )
      }
    }, 100)
  }
  
  const handleScanSuccess = (data: string) => {
    console.log('QR code scanned:', data)
    
    // Prevent multiple processing
    if (isProcessing) {
      console.log('Already processing, ignoring additional scan')
      return
    }
    setIsProcessing(true)
    
    try {
      // First, try to parse as BIP21
      const bip21Data = parseBIP21(data)
      
      if (bip21Data) {
        console.log('Valid BIP21 data:', bip21Data)
        
        // If we have amount, go to confirm screen
        if (bip21Data.amount) {
          navigateToSendConfirm(bip21Data.address, bip21Data.amount)
        } else {
          // If we only have address, go to address screen
          navigateToSendAddress(bip21Data.address)
        }
        return
      }
      
      // If not BIP21, check if it's a plain Bitcoin address
      if (isValidBitcoinAddress(data)) {
        console.log('Valid Bitcoin address:', data)
        navigateToSendAddress(data)
        return
      }
      
      // Not a valid Bitcoin address or invoice
      console.log('Invalid QR code:', data)
      Alert.alert(
        "Invalid QR Code",
        "The scanned QR code doesn't contain a valid Bitcoin address or payment request.",
        [ { text: "OK", onPress: () => setIsProcessing(false) } ]
      )
    } catch (error) {
      console.error('Error processing QR code:', error)
      setIsProcessing(false)
      Alert.alert(
        "Error",
        "There was an error processing the QR code. Please try again.",
        [ { text: "OK" } ]
      )
    }
  }
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: mode === 'scan' ? 'black' : 'white' }
    ]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Content - Either Scanner or QR Code Display */}
      <View style={styles.content}>
        {mode === 'scan' ? (
          <ScannerMode onScanSuccess={handleScanSuccess} />
        ) : (
          <QRCodeMode />
        )}
      </View>
      
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top }
      ]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <X size={24} color={mode === 'scan' ? 'white' : 'black'} />
        </TouchableOpacity>
        
        {/* Toggle between scan and QR display modes */}
        <ModeToggle 
          activeMode={mode} 
          onModeChange={setMode} 
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },
  header : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
    padding        : 20,
    position       : 'relative',
    zIndex         : 10, // Ensure header appears above the camera
  },
  closeButton : {
    position : 'absolute',
    left     : 20,
    top      : 60,
    padding  : 8,
    zIndex   : 10, // Ensure button appears above the camera
  },
  toggleContainer : {
    flexDirection   : 'row',
    backgroundColor : '#E0E0E0',
    borderRadius    : 30,
    overflow        : 'hidden',
    marginTop       : 50,
    zIndex          : 10, // Ensure toggle appears above the camera
  },
  toggleButton : {
    paddingVertical   : 12,
    paddingHorizontal : 24,
    minWidth          : 100,
    alignItems        : 'center',
  },
  toggleButtonLeft : {
    borderTopLeftRadius    : 30,
    borderBottomLeftRadius : 30,
  },
  toggleButtonRight : {
    borderTopRightRadius    : 30,
    borderBottomRightRadius : 30,
  },
  activeToggleButton : {
    backgroundColor : Colors.light.buttons.primary,
  },
  toggleButtonText : {
    color      : '#333',
    fontWeight : '600',
    fontSize   : 16,
  },
  activeToggleButtonText : {
    color      : Colors.light.buttons.text,
    fontWeight : 'bold',
  },
  content : {
    flex     : 1,
    width    : '100%',
    position : 'absolute',
    top      : 0,
    bottom   : 0,
    left     : 0,
    right    : 0,
  },
  
  // Scanner mode styles
  scannerContainer : {
    flex           : 1,
    width          : '100%',
    height         : '100%',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  camera : {
    width    : '100%',
    height   : '100%',
    position : 'absolute',
    top      : 0,
    left     : 0,
  },
  cameraError : {
    flex           : 1,
    alignItems     : 'center',
    justifyContent : 'center',
    padding        : 20,
  },
  errorText : {
    color        : 'white',
    textAlign    : 'center',
    marginBottom : 20,
  },

  // Frame corners for scanner
  frameContainer : {
    width    : FRAME_WIDTH,
    height   : FRAME_HEIGHT,
    position : 'absolute',
    zIndex   : 5,
  },
  corner : {
    width    : FRAME_CORNER_SIZE,
    height   : FRAME_CORNER_SIZE,
    position : 'absolute',
  },
  cornerBorder : {
    backgroundColor : 'white',
    position        : 'absolute',
  },
  topLeft : {
    top  : 0,
    left : 0,
  },
  topRight : {
    top   : 0,
    right : 0,
  },
  bottomLeft : {
    bottom : 0,
    left   : 0,
  },
  bottomRight : {
    bottom : 0,
    right  : 0,
  },
  cornerBorderTop : {
    top    : 0,
    left   : 0,
    height : FRAME_BORDER_WIDTH,
    width  : FRAME_CORNER_SIZE,
  },
  cornerBorderRight : {
    top    : 0,
    right  : 0,
    height : FRAME_CORNER_SIZE,
    width  : FRAME_BORDER_WIDTH,
  },
  cornerBorderBottom : {
    bottom : 0,
    left   : 0,
    height : FRAME_BORDER_WIDTH,
    width  : FRAME_CORNER_SIZE,
  },
  cornerBorderLeft : {
    top    : 0,
    left   : 0,
    height : FRAME_CORNER_SIZE,
    width  : FRAME_BORDER_WIDTH,
  },
  scannerInfoContainer : {
    position   : 'absolute',
    bottom     : '15%',
    left       : 0,
    right      : 0,
    alignItems : 'center',
    zIndex     : 5,
  },
  scannerText : {
    color             : 'white',
    fontSize          : 16,
    fontWeight        : '600',
    textAlign         : 'center',
    padding           : 12,
    backgroundColor   : 'rgba(0,0,0,0.5)',
    borderRadius      : 8,
    paddingHorizontal : 20,
  },
  
  // QR code display mode styles
  qrCodeContainer : {
    flex           : 1,
    width          : '100%',
    alignItems     : 'center',
    justifyContent : 'center',
    padding        : 20,
    marginTop      : -50, // Move QR code up
  },
  qrCodeWrapper : {
    padding         : 20,
    backgroundColor : 'white',
    borderRadius    : 10,
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.1,
    shadowRadius    : 4,
    elevation       : 2,
  },
  addressContainer : {
    marginTop  : 20,
    alignItems : 'center',
  },
  addressLabel : {
    fontSize     : 14,
    color        : '#666',
    marginBottom : 5,
  },
  addressText : {
    fontSize         : 14,
    textAlign        : 'center',
    marginHorizontal : 40,
  },
  loadingPlaceholder : {
    width           : FRAME_WIDTH,
    height          : FRAME_WIDTH,
    backgroundColor : '#f0f0f0',
    borderRadius    : 10,
    alignItems      : 'center',
    justifyContent  : 'center',
  },
  loadingText : {
    fontSize : 16,
    color    : '#666',
  },
  addressTouchable : {
    alignItems   : 'center',
    padding      : 8,
    borderRadius : 8,
  },
  copyHint : {
    fontSize  : 12,
    color     : '#007AFF',
    marginTop : 4,
    fontStyle : 'italic',
  },
})

export default QRMenuScreen
