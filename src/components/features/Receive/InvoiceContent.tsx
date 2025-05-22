import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import QRCodeDisplay from './QRCodeDisplay'
import AddressDisplay from './AddressDisplay'
import InvoiceAmountDisplay from './InvoiceAmountDisplay'
import InvoiceActionButtons from './InvoiceActionButtons'

interface InvoiceContentProps {
  address: string
  satsAmount: string
  formattedAmount: string
  onCopy: () => void
  onShare: () => void
  isLoading?: boolean
  isGeneratingAddress?: boolean
  style?: ViewStyle
  receivedAmountSats?: number
  paymentStatusError?: string | null
}

/**
 * Component that combines all invoice display elements into a single component
 */
const InvoiceContent: React.FC<InvoiceContentProps> = (props) => {
  // Destructure only the props we need, omitting satsAmount
  const {
    address,
    satsAmount,
    formattedAmount,
    onCopy,
    onShare,
    isLoading,
    isGeneratingAddress,
    style,
    receivedAmountSats,
    paymentStatusError,
  } = props
  
  // Use a placeholder value when loading to prevent QR code errors
  const qrValue = (() => {
    if (isGeneratingAddress || !address) {
      return ''
    }
    const amountInSats = parseFloat(satsAmount)
    if (isNaN(amountInSats) || amountInSats <= 0) {
      return `bitcoin:${address}`
    }
    const amountInBTC = amountInSats / 100000000
    return `bitcoin:${address}?amount=${amountInBTC.toFixed(8)}`
  })()
  
  return (
    <View style={[ styles.container, style ]}>
      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* QR Code with Address Display directly below */}
        <View style={styles.qrContainer}>
          <QRCodeDisplay 
            value={qrValue}
            horizontalPadding={30}
          />
          
          {/* Display address directly below QR code */}
          <AddressDisplay 
            address={address}
            showLabel={false}
          />
        </View>
        
        {/* Amount Display */}
        <InvoiceAmountDisplay
          formattedAmount={formattedAmount}
          satsAmount={satsAmount}
          receivedAmountSats={receivedAmountSats}
          paymentStatusError={paymentStatusError}
        />
      </View>
      
      {/* Action Buttons - now positioned at bottom with absolute positioning */}
      <InvoiceActionButtons 
        onCopy={onCopy}
        onShare={onShare}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width          : '100%',
    alignItems     : 'center',
    justifyContent : 'flex-start',
    paddingTop     : 16, 
    flex           : 1,
    position       : 'relative'
  },
  contentContainer : {
    width         : '100%',
    alignItems    : 'center',
    paddingBottom : 140 // Add padding at the bottom to account for buttons
  },
  qrContainer : {
    marginTop    : 16,
    marginBottom : 0,
    alignItems   : 'center',
    width        : '100%'
  }
})

export default InvoiceContent 