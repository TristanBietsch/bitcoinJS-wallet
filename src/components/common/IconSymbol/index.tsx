import React from 'react'
import { Platform, Text, TextStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Map SF Symbol names to Ionicons names for cross-platform support
const iconMap: Record<string, string> = {
  'house.fill'                              : 'home',
  'paperplane.fill'                         : 'paper-plane',
  'chevron.left.forwardslash.chevron.right' : 'code-outline',
  // Add more mappings as needed
}

type IconSymbolProps = {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
};

/**
 * IconSymbol component that uses SF Symbols on iOS and fallbacks to Ionicons
 * on other platforms for cross-platform icon support
 */
export function IconSymbol({ name, size = 24, color = 'black', style }: IconSymbolProps) {
  // For iOS, we can use SF Symbols directly
  if (Platform.OS === 'ios') {
    return (
      <Text style={[ { fontSize: size, color }, style ]}>
        {name}
      </Text>
    )
  }
  
  // For other platforms, map to equivalent Ionicons
  const ionIconName = iconMap[name] || 'help-circle'
  return (
    <Ionicons name={ionIconName as any} size={size} color={color} style={style} />
  )
} 