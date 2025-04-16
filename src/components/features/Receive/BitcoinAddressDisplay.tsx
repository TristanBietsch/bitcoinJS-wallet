import React from 'react'
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import QRCode from 'react-native-qrcode-svg'
import CopyButton from '@/src/components/ui/Button/CopyButton'
import { useClipboard } from '@/src/hooks/ui/useClipboard'
import { formatAddressIntoLines } from '@/src/utils/formatting/formatAddress'

interface BitcoinAddressDisplayProps {
  address: string
  label?: string
  showCopyButton?: boolean
  qrSize?: number
}

/**
 * Component for displaying a Bitcoin address with QR code
 */
const BitcoinAddressDisplay = ({
  address,
  label = 'on-chain address:',
  showCopyButton = true,
  qrSize = 240
}: BitcoinAddressDisplayProps) => {
  const { copied, copyToClipboard } = useClipboard()
  
  // Format the bitcoin address into lines for display
  const addressLines = formatAddressIntoLines(address)
  
  return (
    <View style={styles.container}>
      {/* QR Code */}
      <View style={styles.qrContainer} testID="qr-container">
        {address ? (
          <QRCode
            value={address}
            size={qrSize}
            backgroundColor="white"
            color="black"
          />
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
      </View>
      
      {/* Address Display */}
      <ThemedText style={styles.addressLabel}>{label}</ThemedText>
      <View style={styles.addressBox}>
        {address ? (
          addressLines.map((line, index) => (
            <ThemedText key={index} style={styles.addressText}>{line}</ThemedText>
          ))
        ) : (
          <ThemedText style={styles.addressText}>Loading address...</ThemedText>
        )}
      </View>
      
      {/* Copy Button */}
      {showCopyButton && address && (
        <View style={styles.copyButtonContainer}>
          <CopyButton 
            onPress={() => copyToClipboard(address)}
            copied={copied}
            style={styles.copyButton}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems : 'center',
    width      : '100%',
  },
  qrContainer : {
    padding         : 16,
    backgroundColor : 'white',
    borderRadius    : 12,
    marginBottom    : 16,
    width           : '100%',
    maxWidth        : 220,
    alignItems      : 'center',
    justifyContent  : 'center',
    height          : 220,
  },
  addressLabel : {
    fontSize     : 13,
    color        : 'gray',
    marginBottom : 8,
  },
  addressBox : {
    backgroundColor : '#F8F9FA',
    borderRadius    : 8,
    padding         : 12,
    marginBottom    : 16,
    width           : '60%',
    maxWidth        : 350,
    alignItems      : 'center',
    borderWidth     : 1,
    borderColor     : '#E9ECEF',
  },
  addressText : {
    fontSize      : 14,
    color         : 'black',
    fontFamily    : Platform.select({ ios: 'Courier', android: 'monospace' }),
    letterSpacing : 0.5,
    lineHeight    : 22,
  },
  copyButtonContainer : {
    marginVertical : 4,
  },
  copyButton : {
    width   : 48,
    height  : 48,
    padding : 0,
  }
})

export default BitcoinAddressDisplay 