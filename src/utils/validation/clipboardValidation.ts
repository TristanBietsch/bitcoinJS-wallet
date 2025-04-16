import { Clipboard, Platform, Alert } from 'react-native'
import { isValidBitcoinAddress } from './validateAddress'

/**
 * Checks the clipboard for a valid Bitcoin address
 * @param onValidAddressFound Callback when a valid address is found
 * @param onNoValidAddress Callback when no valid address is found
 * @param onError Callback when an error occurs
 */
export const checkClipboardForAddress = async (
  onValidAddressFound: (address: string) => void,
  onNoValidAddress?: () => void,
  onError?: (error: any) => void
): Promise<void> => {
  try {
    const clipboardContent = await Clipboard.getString()
    
    if (clipboardContent && isValidBitcoinAddress(clipboardContent)) {
      onValidAddressFound(clipboardContent)
    } else if (onNoValidAddress) {
      onNoValidAddress()
    }
  } catch (error) {
    console.error('Error checking clipboard:', error)
    if (onError) {
      onError(error)
    }
  }
}

/**
 * Shows an alert asking the user if they want to paste a detected Bitcoin address
 * @param detectedAddress The address found in the clipboard
 * @param onPaste Callback when the user chooses to paste
 * @param onCancel Callback when the user chooses to cancel
 */
export const showPasteAddressAlert = (
  detectedAddress: string,
  onPaste: () => void,
  onCancel: () => void
): void => {
  if (Platform.OS === 'ios') {
    Alert.alert(
      'Paste Bitcoin Address?',
      'A valid Bitcoin address was found in your clipboard. Use it?',
      [
        {
          text    : 'Cancel',
          style   : 'cancel',
          onPress : onCancel
        },
        {
          text    : 'Paste',
          style   : 'default',
          onPress : onPaste
        }
      ],
      { cancelable: false }
    )
  }
} 