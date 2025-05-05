import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Stack } from 'expo-router'
import { X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/src/constants/colors'
import { CameraView, useCameraPermissions } from 'expo-camera'
import QRCode from 'react-native-qrcode-svg'
import { ThemedText } from '@/src/components/ui/Text'

// Constants for QR frame layout
const SCREEN_WIDTH = Dimensions.get('window').width
const FRAME_WIDTH = SCREEN_WIDTH * 0.7
const FRAME_HEIGHT = FRAME_WIDTH
const FRAME_BORDER_WIDTH = 3
const FRAME_CORNER_SIZE = 20

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
      onScanSuccess(data)
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
  // In a real app, this would come from the wallet or API
  const walletAddress = "b3289asjklasdfasdfjasdffasdff7asduf89asdfas0×84" 
  
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
        <ThemedText style={styles.addressText}>
          {walletAddress}
        </ThemedText>
      </View>
    </View>
  )
}

// Main QR Menu Screen Component
const QRMenuScreen: React.FC = () => {
  const [ mode, setMode ] = useState<'scan' | 'qrcode'>('scan')
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const handleClose = () => {
    router.back()
  }
  
  const handleScanSuccess = (data: string) => {
    console.log('Scanned data:', data)
    // Handle the scanned QR code data
    // In a real app, you would process the Bitcoin address here
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
})

export default QRMenuScreen
