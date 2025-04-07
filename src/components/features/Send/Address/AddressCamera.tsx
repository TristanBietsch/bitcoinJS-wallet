import React, { useCallback, useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'

// Get screen dimensions for the frame
const SCREEN_WIDTH = Dimensions.get('window').width
const FRAME_WIDTH = SCREEN_WIDTH * 0.7 // 70% of screen width
const FRAME_HEIGHT = FRAME_WIDTH
const FRAME_BORDER_WIDTH = 3
const FRAME_CORNER_SIZE = 20

interface AddressCameraProps {
  onScanSuccess: (data: string) => void
  onClose: () => void
}

export const AddressCamera: React.FC<AddressCameraProps> = ({
  onScanSuccess,
  onClose,
}) => {
  const insets = useSafeAreaInsets()
  const [ permission, requestPermission ] = useCameraPermissions()
  const [ scanned, setScanned ] = useState(false)

  // Request camera permissions
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
  }, [ permission, requestPermission ])

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    if (data && !scanned) {
      setScanned(true)
      onScanSuccess(data)
    }
  }, [ onScanSuccess, scanned ])

  const handleScanAgain = useCallback(() => {
    setScanned(false)
  }, [])

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

  // Render camera or error message based on permission status
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
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onClose}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
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
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onClose}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      )
    }
  }

  return (
    <View style={styles.container}>
      {renderCamera()}
      
      <View style={[ styles.overlay, { paddingTop: insets.top } ]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {renderFrameCorners()}
        
        <View style={styles.scannerInfoContainer}>
          <ThemedText style={styles.scannerText}>
            {scanned ? 'QR Code Scanned!' : 'Align QR code within frame'}
          </ThemedText>
        </View>

        {scanned && (
          <View style={styles.scanAgainContainer}>
            <TouchableOpacity 
              style={styles.scanAgainButton}
              onPress={handleScanAgain}
            >
              <ThemedText style={styles.scanAgainText}>Tap to Scan Again</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },
  camera : {
    flex : 1,
  },
  cameraError : {
    flex            : 1,
    backgroundColor : '#333',
    justifyContent  : 'center',
    alignItems      : 'center',
    padding         : 20,
  },
  errorText : {
    color        : 'white',
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 20,
  },
  retryButton : {
    backgroundColor   : '#FF0000',
    paddingVertical   : 12,
    paddingHorizontal : 24,
    borderRadius      : 8,
  },
  retryButtonText : {
    color      : 'white',
    fontSize   : 16,
    fontWeight : '600',
  },
  overlay : {
    ...StyleSheet.absoluteFillObject,
    justifyContent : 'space-between',
  },
  header : {
    flexDirection  : 'row',
    justifyContent : 'flex-end',
    padding        : 16,
  },
  closeButton : {
    width           : 40,
    height          : 40,
    borderRadius    : 20,
    backgroundColor : 'rgba(0, 0, 0, 0.3)',
    justifyContent  : 'center',
    alignItems      : 'center',
  },
  frameContainer : {
    position  : 'absolute',
    top       : '50%',
    left      : '50%',
    width     : FRAME_WIDTH,
    height    : FRAME_HEIGHT,
    transform : [
      { translateX: -FRAME_WIDTH / 2 },
      { translateY: -FRAME_HEIGHT / 2 }
    ],
  },
  corner : {
    position : 'absolute',
    width    : FRAME_CORNER_SIZE,
    height   : FRAME_CORNER_SIZE,
  },
  cornerBorder : {
    position        : 'absolute',
    backgroundColor : 'white',
  },
  cornerBorderTop : {
    top    : 0,
    width  : FRAME_CORNER_SIZE,
    height : FRAME_BORDER_WIDTH,
  },
  cornerBorderBottom : {
    bottom : 0,
    width  : FRAME_CORNER_SIZE,
    height : FRAME_BORDER_WIDTH,
  },
  cornerBorderLeft : {
    left   : 0,
    width  : FRAME_BORDER_WIDTH,
    height : FRAME_CORNER_SIZE,
  },
  cornerBorderRight : {
    right  : 0,
    width  : FRAME_BORDER_WIDTH,
    height : FRAME_CORNER_SIZE,
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
  scannerInfoContainer : {
    padding      : 20,
    marginBottom : 50,
    alignItems   : 'center',
  },
  scannerText : {
    color           : 'white',
    fontSize        : 16,
    fontWeight      : '600',
    textAlign       : 'center',
    backgroundColor : 'rgba(0, 0, 0, 0.6)',
    padding         : 16,
    borderRadius    : 8,
  },
  scanAgainContainer : {
    alignItems   : 'center',
    marginBottom : 30,
  },
  scanAgainButton : {
    backgroundColor   : 'rgba(255, 255, 255, 0.2)',
    paddingVertical   : 10,
    paddingHorizontal : 20,
    borderRadius      : 20,
  },
  scanAgainText : {
    color    : 'white',
    fontSize : 16,
  },
})
