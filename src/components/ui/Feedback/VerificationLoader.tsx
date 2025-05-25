import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface VerificationLoaderProps {
  title?: string
  subtitle?: string
  indicatorSize?: 'small' | 'large'
  indicatorColor?: string
}

/**
 * A reusable component to display a loading state during verification processes
 */
const VerificationLoader: React.FC<VerificationLoaderProps> = ({
  title = 'Verifying...',
  subtitle = 'Please wait',
  indicatorSize = 'large',
  indicatorColor = Colors.light.buttons.primary
}) => {
  return (
    <View style={styles.content}>
      {title && (
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
      )}
      
      {subtitle && (
        <ThemedText style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
      
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={indicatorSize} color={indicatorColor} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content : {
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    paddingHorizontal : 20
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 40
  },
  indicatorContainer : {
    marginTop : 20
  }
})

export default VerificationLoader 