import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import QRCodeDisplay from './QRCodeDisplay'
import AddressDisplay from './AddressDisplay'
import InvoiceAmountDisplay from './InvoiceAmountDisplay'
import InvoiceActionButtons from './InvoiceActionButtons'

interface InvoiceContentProps {
  address: string
  satsAmount: string
  usdAmount: string
  onCopy: () => void
  onShare: () => void
  isLoading?: boolean
  style?: ViewStyle
}

/**
 * Component that combines all invoice display elements into a single component
 */
const InvoiceContent: React.FC<InvoiceContentProps> = ({
  address,
  satsAmount,
  usdAmount,
  onCopy,
  onShare,
  isLoading: _isLoading = false,
  style
}) => {
  // Use a placeholder value when loading to prevent QR code errors
  const qrValue = _isLoading ? 'loading' : address
  
  return (
    <View style={[ styles.container, style ]}>
      {/* QR Code */}
      <View style={styles.qrContainer}>
        <QRCodeDisplay 
          value={qrValue} 
          size={200}
        />
      </View>
      
      {/* Amount Display */}
      <InvoiceAmountDisplay
        satsAmount={satsAmount}
        usdAmount={usdAmount}
      />
      
      {/* Address Display */}
      <AddressDisplay 
        address={address}
        label="on-chain address:"
      />
      
      {/* Action Buttons */}
      <InvoiceActionButtons 
        onCopy={onCopy}
        onShare={onShare}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width           : '100%',
    alignItems      : 'center',
    justifyContent  : 'center',
    paddingVertical : 16
  },
  qrContainer : {
    marginTop    : 40,
    marginBottom : 20
  }
})

export default InvoiceContent 