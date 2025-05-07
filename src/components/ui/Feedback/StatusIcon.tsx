import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Check, X, AlertCircle, Info } from 'lucide-react-native'
import { StatusType, getStatusColors } from '@/src/types/status.types'

interface StatusIconProps {
  type: StatusType
  size?: number
  strokeWidth?: number
  containerStyle?: ViewStyle
}

/**
 * A reusable status icon component that displays the appropriate icon based on status type
 */
const StatusIcon: React.FC<StatusIconProps> = ({
  type,
  size = 90,
  strokeWidth = 2,
  containerStyle
}) => {
  const colors = getStatusColors(type)
  
  // Render the appropriate icon based on status type
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <Check size={size} color={colors.icon} strokeWidth={strokeWidth} />
      case 'error':
        return <X size={size} color={colors.icon} strokeWidth={strokeWidth} />
      case 'warning':
        return <AlertCircle size={size} color={colors.icon} strokeWidth={strokeWidth} />
      case 'info':
        return <Info size={size} color={colors.icon} strokeWidth={strokeWidth} />
      case 'loading':
        return <Info size={size} color={colors.icon} strokeWidth={strokeWidth} />
      default:
        return <Info size={size} color={colors.icon} strokeWidth={strokeWidth} />
    }
  }
  
  return (
    <View style={[
      styles.iconContainer,
      { backgroundColor: colors.background },
      containerStyle
    ]}>
      {renderIcon()}
    </View>
  )
}

const styles = StyleSheet.create({
  iconContainer : {
    width          : 160,
    height         : 160,
    borderRadius   : 80,
    alignItems     : 'center',
    justifyContent : 'center',
    marginVertical : 40
  }
})

export default StatusIcon 