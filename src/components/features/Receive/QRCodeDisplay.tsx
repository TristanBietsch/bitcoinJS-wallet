import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ViewStyle, ActivityIndicator, Dimensions } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

interface QRCodeDisplayProps {
  value: string
  size?: number
  color?: string
  backgroundColor?: string
  style?: ViewStyle
  horizontalPadding?: number
}

/**
 * Component to display a QR code
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size: propSize,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  style,
  horizontalPadding = 30
}) => {
  // Use placeholder text if value is empty to prevent QR code errors
  const qrValue = value && value.trim() ? value : 'placeholder-loading'
  
  // Calculate QR code size based on screen width minus padding
  const [ qrSize, setQrSize ] = useState(300)
  
  useEffect(() => {
    const screenWidth = Dimensions.get('window').width
    const calculatedSize = screenWidth - (horizontalPadding * 2)
    setQrSize(calculatedSize)
  }, [ horizontalPadding ])
  
  // Use provided size prop if specified, otherwise use calculated size
  const finalSize = propSize || qrSize
  
  return (
    <View style={[ styles.container, { width: finalSize, height: finalSize }, style ]}>
      {!value || value.trim() === '' ? (
        // Show loading indicator when value is empty
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        // Show QR code when we have a value
        <QRCode
          value={qrValue}
          size={finalSize}
          color={color}
          backgroundColor={backgroundColor}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems     : 'center',
    justifyContent : 'center',
    padding        : 0,
  }
})

export default QRCodeDisplay 