import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Check, AlertCircle, X } from 'lucide-react-native'

type StatusType = 'success' | 'warning' | 'error' | 'custom'

interface StatusIconProps {
  type?: StatusType
  icon?: ReactNode
  size?: number
  color?: string
  backgroundColor?: string
  style?: ViewStyle
}

/**
 * A reusable status icon component for success, warning, or error states
 */
const StatusIcon: React.FC<StatusIconProps> = ({
  type = 'success',
  icon,
  size = 32,
  color = 'white',
  backgroundColor,
  style
}) => {
  // Determine default background color based on status type
  const getBgColor = () => {
    if (backgroundColor) return backgroundColor
    
    switch(type) {
      case 'success': return '#22C55E'
      case 'warning': return '#F59E0B'
      case 'error': return '#DC2626'
      default: return '#22C55E'
    }
  }
  
  // Determine which icon to display
  const getIcon = () => {
    if (icon) return icon
    
    switch(type) {
      case 'success': return <Check size={size} color={color} />
      case 'warning': return <AlertCircle size={size} color={color} />
      case 'error': return <X size={size} color={color} />
      default: return <Check size={size} color={color} />
    }
  }
  
  return (
    <View 
      style={[
        styles.iconContainer,
        { 
          width           : size * 2,
          height          : size * 2,
          borderRadius    : size,
          backgroundColor : getBgColor() 
        },
        style
      ]}
    >
      {getIcon()}
    </View>
  )
}

const styles = StyleSheet.create({
  iconContainer : {
    alignItems     : 'center',
    justifyContent : 'center',
    marginBottom   : 24,
  }
})

export default StatusIcon 