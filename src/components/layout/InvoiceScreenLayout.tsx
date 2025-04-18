import React, { ReactNode } from 'react'
import { StyleSheet, ViewStyle, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import SafeAreaContainer from './SafeAreaContainer'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'

interface InvoiceScreenLayoutProps {
  children: ReactNode
  onBackPress: () => void
  _headerStyle?: ViewStyle
  contentStyle?: ViewStyle
}

/**
 * Layout component for invoice display screens, optimized for the payment request flow
 */
const InvoiceScreenLayout: React.FC<InvoiceScreenLayoutProps> = ({
  children,
  onBackPress,
  _headerStyle,
  contentStyle
}) => {
  return (
    <SafeAreaContainer style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <BackButton onPress={onBackPress} />
      
      <ScrollView 
        contentContainerStyle={[ styles.scrollContent, contentStyle ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : 'white',
  },
  scrollContent : {
    flexGrow          : 1,
    alignItems        : 'center',
    paddingHorizontal : 24,
    paddingBottom     : 40,
    paddingTop        : 30,
  }
})

export default InvoiceScreenLayout 