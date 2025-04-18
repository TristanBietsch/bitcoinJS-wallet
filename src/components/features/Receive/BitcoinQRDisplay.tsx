import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import BitcoinAddressDisplay from './BitcoinAddressDisplay'
import ActionButtonsContainer from '@/src/components/ui/Button/ActionButtonsContainer'
import CopyButton from '@/src/components/ui/Button/CopyButton'
import ShareButton from '@/src/components/ui/Button/ShareButton'

interface BitcoinQRDisplayProps {
  address: string
  style?: ViewStyle
  qrSize?: number
  label?: string
  shareMessage?: string
  shareTitle?: string
  onCopy: () => void
  copied: boolean
  showButtons?: boolean
}

/**
 * Enhanced component to display Bitcoin address with QR code and action buttons
 */
const BitcoinQRDisplay: React.FC<BitcoinQRDisplayProps> = ({
  address,
  style,
  qrSize = 180,
  label = 'bitcoin address:',
  shareMessage,
  shareTitle = 'Bitcoin Payment Request',
  onCopy,
  copied,
  showButtons = true
}) => {
  const finalShareMessage = shareMessage || `Bitcoin Address: ${address}`
  
  return (
    <View style={[ styles.container, style ]}>
      <BitcoinAddressDisplay 
        address={address} 
        showCopyButton={false}
        qrSize={qrSize}
        label={label}
      />
      
      {showButtons && (
        <ActionButtonsContainer>
          <CopyButton 
            onPress={onCopy}
            copied={copied}
            style={styles.actionButton}
          />
          <ShareButton 
            message={finalShareMessage}
            title={shareTitle}
            style={styles.actionButton}
          />
        </ActionButtonsContainer>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width          : '100%',
    alignItems     : 'center',
    marginVertical : 16,
  },
  actionButton : {
    width          : 48,
    height         : 48,
    padding        : 0,
    borderRadius   : 24,
    alignItems     : 'center',
    justifyContent : 'center',
  }
})

export default BitcoinQRDisplay 