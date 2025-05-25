import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
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
  addressGenerationError?: string | null
  style?: ViewStyle
  receivedAmountSats?: number
  paymentStatusError?: string | null
  actionsDisabled?: boolean
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
    isLoading: _isLoading,
    isGeneratingAddress,
    addressGenerationError,
    style,
    receivedAmountSats,
    paymentStatusError,
    actionsDisabled = false,
  } = props
  
  // Use a placeholder value when loading to prevent QR code errors
  const qrValue = (() => {
    if (addressGenerationError || isGeneratingAddress || !address) {
      return ''
    }
    const amountInSats = parseFloat(satsAmount)
    if (isNaN(amountInSats) || amountInSats <= 0) {
      return `bitcoin:${address}`
    }
    const amountInBTC = amountInSats / 100000000
    return `bitcoin:${address}?amount=${amountInBTC.toFixed(8)}`
  })()
  
  // Only disable buttons if address generation is in progress or failed, not for balance loading
  const shouldDisableButtons = actionsDisabled || isGeneratingAddress || !address || !!addressGenerationError
  
  return (
    <View style={[ styles.container, style ]}>
      {/* Main content container */}
      <View style={styles.contentContainer}>
        {addressGenerationError && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorTextAddressGeneration}>
              Error generating address: {addressGenerationError}
            </ThemedText>
            <ThemedText style={styles.errorHintText}>
              Please ensure your wallet is set up correctly and try again.
            </ThemedText>
          </View>
        )}

        {!addressGenerationError && (
          <>
            <View style={styles.qrContainer}>
              <QRCodeDisplay 
                value={qrValue}
                horizontalPadding={30}
              />
              
              {/* Display full URI directly below QR code */}
              <AddressDisplay 
                address={qrValue || address}
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
          </>
        )}
      </View>
      
      {/* Action Buttons - now positioned at bottom with absolute positioning */}
      {!addressGenerationError && (
        <InvoiceActionButtons 
          onCopy={onCopy}
          onShare={onShare}
          disabled={shouldDisableButtons}
        />
      )}
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
    position       : 'relative',
  },
  contentContainer : {
    width         : '100%',
    alignItems    : 'center',
    paddingBottom : 140,
  },
  qrContainer : {
    marginTop    : 16,
    marginBottom : 0,
    alignItems   : 'center',
    width        : '100%',
  },
  errorContainer : {
    padding         : 20,
    marginVertical  : 20,
    alignItems      : 'center',
    width           : '90%',
    backgroundColor : '#ffe0e0',
    borderRadius    : 8,
  },
  errorTextAddressGeneration : {
    fontSize     : 16,
    color        : '#D8000C',
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 8,
  },
  errorHintText : {
    fontSize  : 14,
    color     : '#555',
    textAlign : 'center',
  },
})

export default InvoiceContent 