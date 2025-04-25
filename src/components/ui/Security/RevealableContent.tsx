import React, { ReactNode } from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { BlurView } from 'expo-blur'
import { ThemedText } from '@/src/components/ui/Text'

interface RevealableContentProps {
  children: ReactNode
  isRevealed: boolean
  onToggle: () => void
  revealText?: string
  hideText?: string
  containerStyle?: ViewStyle
  iconSize?: number
  blurIntensity?: number
  blurTint?: 'light' | 'dark' | 'default'
}

/**
 * A component for securely displaying sensitive content with reveal/hide functionality
 */
const RevealableContent: React.FC<RevealableContentProps> = ({
  children,
  isRevealed,
  onToggle,
  revealText = 'Tap To Reveal',
  hideText = 'Tap To Hide',
  containerStyle,
  iconSize = 24,
  blurIntensity = 70,
  blurTint = 'light'
}) => {
  return (
    <View style={[ styles.container, containerStyle ]}>
      {/* The actual content */}
      {children}
      
      {/* Blur overlay when content is hidden */}
      {!isRevealed && (
        <TouchableOpacity 
          style={styles.revealOverlay} 
          activeOpacity={0.9}
          onPress={onToggle}
        >
          <BlurView intensity={blurIntensity} tint={blurTint} style={styles.revealBlur} />
          <View style={styles.tapToRevealContainer}>
            <View style={styles.revealContentRow}>
              <Eye size={iconSize} color="#222" />
              <ThemedText style={styles.tapText}>
                {revealText}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Button to hide content when revealed */}
      {isRevealed && hideText && (
        <TouchableOpacity 
          style={styles.hideButton} 
          onPress={onToggle}
        >
          <EyeOff size={iconSize - 4} color="#000" />
          <ThemedText style={styles.hideButtonText}>{hideText}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    position : 'relative',
    width    : '100%',
    overflow : 'hidden',
  },
  revealOverlay : {
    position       : 'absolute',
    top            : 0,
    left           : 0,
    right          : 0,
    bottom         : 0,
    justifyContent : 'center',
    alignItems     : 'center',
    zIndex         : 1,
  },
  revealBlur : {
    position : 'absolute',
    top      : 0,
    left     : 0,
    right    : 0,
    bottom   : 0,
  },
  tapToRevealContainer : {
    alignItems     : 'center',
    justifyContent : 'center',
    height         : '100%',
    zIndex         : 2,
  },
  revealContentRow : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  tapText : {
    fontSize   : 16,
    fontWeight : '500',
    marginLeft : 8,
  },
  hideButton : {
    flexDirection   : 'row',
    alignItems      : 'center',
    justifyContent  : 'center',
    marginTop       : 20,
    paddingVertical : 10,
  },
  hideButtonText : {
    marginLeft : 8,
    fontSize   : 16,
    fontWeight : '500',
  },
})

export default RevealableContent 