import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { ThemedText } from '@/src/components/ui/Text'

interface ErrorDetailsLayoutProps {
  children: ReactNode
  title?: string
  helpText?: string
  onBackPress: () => void
  style?: ViewStyle
  containerStyle?: ViewStyle
}

/**
 * Layout component for error details screens
 */
const ErrorDetailsLayout: React.FC<ErrorDetailsLayoutProps> = ({
  children,
  title = 'Error Details',
  helpText = 'If you need help, share this error with the developer for further help.',
  onBackPress,
  style,
  containerStyle
}) => {
  return (
    <SafeAreaContainer style={style}>
      <View style={[ styles.container, containerStyle ]}>
        {/* Back Button Container */}
        <View style={styles.backButtonContainer}>
          <BackButton onPress={onBackPress} />
        </View>
        
        {/* Header */}
        <ThemedText style={styles.header}>{title}</ThemedText>
        
        {/* Help Text */}
        {helpText && (
          <ThemedText style={styles.helpText}>
            {helpText}
          </ThemedText>
        )}
        
        {/* Content */}
        {children}
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex       : 1,
    padding    : 16,
    alignItems : 'center'
  },
  backButtonContainer : {
    position : 'absolute',
    top      : 10,
    left     : 10,
    zIndex   : 1
  },
  header : {
    fontSize     : 24,
    fontWeight   : 'bold',
    marginTop    : 48,
    marginBottom : 32
  },
  helpText : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 32,
    paddingHorizontal : 20
  }
})

export default ErrorDetailsLayout 