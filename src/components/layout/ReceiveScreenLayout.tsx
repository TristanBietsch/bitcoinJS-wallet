import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Stack } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from './SafeAreaContainer'

interface ReceiveScreenLayoutProps {
  children: ReactNode
  onBackPress: () => void
  showHeader?: boolean
  _containerStyle?: ViewStyle
  contentStyle?: ViewStyle
}

/**
 * Layout component for screens in the Receive flow
 */
const ReceiveScreenLayout: React.FC<ReceiveScreenLayoutProps> = ({
  children,
  onBackPress,
  showHeader = true,
  _containerStyle,
  contentStyle
}) => {
  return (
    <SafeAreaContainer style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {showHeader && (
        <BackButton onPress={onBackPress} />
      )}
      
      <View style={[ styles.content, contentStyle ]}>
        {children}
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : 'white',
  },
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 24,
  }
})

export default ReceiveScreenLayout 