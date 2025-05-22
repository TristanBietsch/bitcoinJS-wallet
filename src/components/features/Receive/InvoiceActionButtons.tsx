import React from 'react'
import { View, StyleSheet, TouchableOpacity, ViewStyle, Dimensions } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Copy } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'

interface InvoiceActionButtonsProps {
  onShare: () => void
  onCopy: () => void
  style?: ViewStyle
  disabled?: boolean
}

/**
 * Component for invoice action buttons - Share button and Copy button
 */
const InvoiceActionButtons: React.FC<InvoiceActionButtonsProps> = ({
  onShare,
  onCopy,
  style,
  disabled = false,
}) => {
  // Calculate dynamic button width based on screen size
  const screenWidth = Dimensions.get('window').width
  const shareButtonWidth = screenWidth * 0.6 // 60% of screen width
  
  const buttonOpacity = disabled ? 0.5 : 1 // Style for disabled state

  return (
    <View style={[ styles.container, style ]}>
      {/* Share Button */}
      <TouchableOpacity 
        style={[ styles.shareButton, { width: shareButtonWidth, opacity: buttonOpacity } ]}
        onPress={onShare}
        disabled={disabled}
      >
        <ThemedText style={styles.shareButtonText}>Share</ThemedText>
      </TouchableOpacity>
      
      {/* Copy Button */}
      <TouchableOpacity 
        style={[ styles.copyButton, { opacity: buttonOpacity } ]}
        onPress={onCopy}
        disabled={disabled}
      >
        <Copy size={24} color={disabled ? '#a0a0a0' : '#000'} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flexDirection     : 'row',
    alignItems        : 'center',
    justifyContent    : 'center',
    marginTop         : 40,
    width             : '100%',
    position          : 'absolute',
    bottom            : 20,
    left              : 0,
    paddingHorizontal : 16
  },
  shareButton : {
    backgroundColor : Colors.light.buttons.primary,
    borderRadius    : 50,
    paddingVertical : 16,
    flexDirection   : 'row',
    alignItems      : 'center',
    justifyContent  : 'center',
    marginRight     : 12,
    elevation       : 2,
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.1,
    shadowRadius    : 4
  },
  shareButtonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 18,
    fontWeight : 'bold'
  },
  copyButton : {
    backgroundColor : 'white',
    borderWidth     : 1,
    borderColor     : '#E0E0E0',
    borderRadius    : 30,
    width           : 56,
    height          : 56,
    alignItems      : 'center',
    justifyContent  : 'center',
    elevation       : 2,
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.1,
    shadowRadius    : 4
  }
})

export default InvoiceActionButtons 