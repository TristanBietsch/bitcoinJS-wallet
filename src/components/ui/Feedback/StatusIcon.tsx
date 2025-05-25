import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StatusType } from '@/src/types/ui/status.types'

interface StatusIconProps {
  type: StatusType;
  size?: number;
}

/**
 * A reusable status icon component that displays the appropriate icon based on status type
 */
export default function StatusIcon({ type, size = 60 }: StatusIconProps) {
  if (type === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={size / 2} color="#2196F3" />
      </View>
    )
  }

  const getIconInfo = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#4CAF50' }
      case 'error':
        return { name: 'close-circle', color: '#F44336' }
      case 'warning':
        return { name: 'warning', color: '#FF9800' }
      case 'info':
        return { name: 'information-circle', color: '#2196F3' }
      default:
        return { name: 'information-circle', color: 'gray' }
    }
  }

  const { name, color } = getIconInfo()

  return (
    <View style={styles.container}>
      <Ionicons name={name as any} size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems     : 'center',
    justifyContent : 'center',
    marginVertical : 20,
  },
}) 