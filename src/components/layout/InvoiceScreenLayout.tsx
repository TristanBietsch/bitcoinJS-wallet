import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Stack } from 'expo-router'
import SafeAreaContainer from './SafeAreaContainer'
import HeaderBackButton from '@/src/components/ui/Navigation/HeaderBackButton'

interface InvoiceScreenLayoutProps {
  children: ReactNode
  onBackPress: () => void
  headerStyle?: ViewStyle
  contentStyle?: ViewStyle
}

/**
 * Layout component for invoice display screens
 */
const InvoiceScreenLayout: React.FC<InvoiceScreenLayoutProps> = ({
  children,
  onBackPress,
  headerStyle,
  contentStyle
}) => {
  return (
    <SafeAreaContainer style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[ styles.header, headerStyle ]}>
        <HeaderBackButton onPress={onBackPress} />
      </View>
      
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
  header : {
    paddingHorizontal : 16,
    paddingTop        : 12,
    paddingBottom     : 0,
    height            : 56,
  },
  content : {
    flex              : 1,
    justifyContent    : 'flex-start',
    alignItems        : 'center',
    paddingHorizontal : 24,
    paddingBottom     : 20,
  }
})

export default InvoiceScreenLayout 