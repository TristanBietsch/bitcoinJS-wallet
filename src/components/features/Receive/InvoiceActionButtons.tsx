import React from 'react'
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Copy } from 'lucide-react-native'

interface InvoiceActionButtonsProps {
  onShare: () => void
  onCopy: () => void
  style?: ViewStyle
}

/**
 * Component for invoice action buttons - Share button and Copy button
 */
const InvoiceActionButtons: React.FC<InvoiceActionButtonsProps> = ({
  onShare,
  onCopy,
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      {/* Share Button */}
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={onShare}
      >
        <ThemedText style={styles.shareButtonText}>Share</ThemedText>
      </TouchableOpacity>
      
      {/* Copy Button */}
      <TouchableOpacity 
        style={styles.copyButton}
        onPress={onCopy}
      >
        <Copy size={20} color="#000" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
    marginVertical : 24,
    width          : '80%'
  },
  shareButton : {
    backgroundColor   : '#FF3B30',
    borderRadius      : 50,
    paddingVertical   : 12,
    paddingHorizontal : 40,
    flexDirection     : 'row',
    alignItems        : 'center',
    justifyContent    : 'center',
    marginRight       : 8
  },
  shareButtonText : {
    color      : 'white',
    fontSize   : 16,
    fontWeight : 'bold'
  },
  copyButton : {
    backgroundColor : 'white',
    borderWidth     : 1,
    borderColor     : '#E0E0E0',
    borderRadius    : 24,
    width           : 48,
    height          : 48,
    alignItems      : 'center',
    justifyContent  : 'center'
  }
})

export default InvoiceActionButtons 