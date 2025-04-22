import React, { ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { ThemedText } from '@/src/components/ui/Text'

interface SimpleScreenLayoutProps {
  title: string
  onBackPress: () => void
  children?: ReactNode
}

/**
 * A simple screen layout with centered text and back button
 * Used for basic menu screens
 */
const SimpleScreenLayout: React.FC<SimpleScreenLayoutProps> = ({
  title,
  onBackPress,
  children
}) => {
  return (
    <SafeAreaContainer>
      <Stack.Screen options={{ headerShown: false }} />
      
      <BackButton onPress={onBackPress} />
      
      <View style={styles.container}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {children}
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    paddingHorizontal : 20
  },
  title : {
    fontSize     : 24,
    fontWeight   : 'bold',
    marginBottom : 20
  }
})

export default SimpleScreenLayout 