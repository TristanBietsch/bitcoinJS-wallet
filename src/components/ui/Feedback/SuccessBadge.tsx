import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import useColorScheme from '@/src/hooks/ui/useColorScheme'

interface SuccessBadgeProps {
  message: string
  style?: object
}

/**
 * A reusable success badge component that displays a success message
 */
const SuccessBadge: React.FC<SuccessBadgeProps> = ({
  message,
  style
}) => {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]
  
  return (
    <View style={styles.successContainer}>
      <View 
        style={[
          styles.successBadge, 
          { backgroundColor: colorScheme === 'light' ? Colors.light.successGreen : colors.tint },
          style
        ]}
      >
        <ThemedText style={styles.successText}>
          {message}
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  successContainer : {
    width      : '100%',
    alignItems : 'center',
    marginTop  : 30,
  },
  successBadge : {
    paddingVertical   : 10,
    paddingHorizontal : 20,
    borderRadius      : 20,
  },
  successText : {
    color      : '#FFFFFF',
    fontWeight : '600',
  },
})

export default SuccessBadge 