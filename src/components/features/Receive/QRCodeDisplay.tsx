import React from 'react'
import { View, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

interface QRCodeDisplayProps {
  value: string
  size?: number
  color?: string
  backgroundColor?: string
  style?: ViewStyle
}

/**
 * Component to display a QR code
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 180,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  style
}) => {
  // Use placeholder text if value is empty to prevent QR code errors
  const qrValue = value && value.trim() ? value : 'placeholder-loading'
  
  return (
    <View style={[ styles.container, style ]}>
      {!value || value.trim() === '' ? (
        // Show loading indicator when value is empty
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        // Show QR code when we have a value
        <QRCode
          value={qrValue}
          size={size}
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
    padding        : 8,
    width          : 200,
    height         : 200
  }
})

export default QRCodeDisplay 