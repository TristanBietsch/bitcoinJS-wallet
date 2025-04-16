import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { Copy, Check } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface CopyButtonProps {
  onPress: () => void
  copied: boolean
  style?: ViewStyle
  iconSize?: number
  iconColor?: string
  showLabel?: boolean
  label?: string
  testID?: string
}

/**
 * Reusable copy button component that shows a check mark when copied
 */
const CopyButton = ({
  onPress,
  copied,
  style,
  iconSize = 24,
  iconColor = 'white',
  showLabel = false,
  label = 'Copy',
  testID = 'copy-button'
}: CopyButtonProps) => {
  return (
    <TouchableOpacity
      style={[ styles.copyButton, style ]}
      onPress={onPress}
      testID={testID}
    >
      {copied ? (
        <>
          <Check size={iconSize} color={iconColor} testID="check-icon" />
          {showLabel && <ThemedText style={styles.buttonText}>Copied</ThemedText>}
        </>
      ) : (
        <>
          <Copy size={iconSize} color={iconColor} testID="copy-icon" />
          {showLabel && <ThemedText style={styles.buttonText}>{label}</ThemedText>}
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  copyButton : {
    backgroundColor : 'red',
    borderRadius    : 30,
    padding         : 12,
    alignItems      : 'center',
    justifyContent  : 'center',
    flexDirection   : 'row',
    gap             : 8
  },
  buttonText : {
    color      : 'white',
    fontWeight : 'bold',
    fontSize   : 16
  }
})

export default CopyButton 