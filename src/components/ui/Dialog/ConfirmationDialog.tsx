import { Alert, AlertButton } from 'react-native'

export interface ConfirmationDialogProps {
  /**
   * Title of the confirmation dialog
   */
  title: string
  
  /**
   * Message to display in the dialog
   */
  message: string
  
  /**
   * Callback for when the user confirms the action
   */
  onConfirm: () => void
  
  /**
   * Callback for when the user cancels the action
   * @default undefined - no callback
   */
  onCancel?: () => void
  
  /**
   * Text for the confirm button
   * @default "Confirm"
   */
  confirmText?: string
  
  /**
   * Text for the cancel button
   * @default "Cancel"
   */
  cancelText?: string
  
  /**
   * Style for the confirm button
   * @default "default"
   */
  confirmStyle?: AlertButton['style']
  
  /**
   * Style for the cancel button
   * @default "cancel"
   */
  cancelStyle?: AlertButton['style']
}

/**
 * Show a confirmation dialog with customizable buttons and callbacks.
 * 
 * @example
 * ```
 * // Basic usage
 * showConfirmationDialog({
 *   title: "Confirm Action",
 *   message: "Are you sure you want to proceed?",
 *   onConfirm: () => console.log("User confirmed"),
 * });
 * 
 * // Custom button text and styles
 * showConfirmationDialog({
 *   title: "Delete Item",
 *   message: "This action cannot be undone",
 *   confirmText: "Delete",
 *   confirmStyle: "destructive",
 *   onConfirm: handleDelete,
 *   onCancel: () => console.log("User cancelled")
 * });
 * ```
 */
export const showConfirmationDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "default",
  cancelStyle = "cancel"
}: ConfirmationDialogProps): void => {
  
  // Create buttons array
  const buttons: AlertButton[] = [
    {
      text    : cancelText,
      style   : cancelStyle,
      onPress : onCancel
    },
    {
      text    : confirmText,
      style   : confirmStyle,
      onPress : onConfirm
    }
  ]

  // Show the Alert
  Alert.alert(title, message, buttons)
}

export default showConfirmationDialog 