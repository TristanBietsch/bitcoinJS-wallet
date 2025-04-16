import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle, Share } from 'react-native'
import { Share2 } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface ShareButtonProps {
  message: string
  title?: string
  style?: ViewStyle
  iconSize?: number
  iconColor?: string
  label?: string
  testID?: string
}

/**
 * Reusable share button component
 */
const ShareButton = ({
  message,
  title,
  style,
  iconSize = 24,
  iconColor = 'white',
  label = 'Share',
  testID = 'share-button'
}: ShareButtonProps) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message,
        title
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <TouchableOpacity
      style={[ styles.shareButton, style ]}
      onPress={handleShare}
      testID={testID}
    >
      <Share2 size={iconSize} color={iconColor} />
      <ThemedText style={styles.buttonText}>{label}</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  shareButton : {
    backgroundColor   : 'red',
    borderRadius      : 30,
    paddingVertical   : 12,
    paddingHorizontal : 24,
    alignItems        : 'center',
    justifyContent    : 'center',
    flexDirection     : 'row',
    gap               : 8
  },
  buttonText : {
    color      : 'white',
    fontWeight : 'bold',
    fontSize   : 16
  }
})

export default ShareButton 